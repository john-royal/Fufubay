import { Prisma, User, UserRole } from '@prisma/client'
import { UploadedFile } from 'express-fileupload'
import { extname } from 'path'
import Stripe from 'stripe'
import { ForbiddenError, prisma, s3, scrypt, stripe } from '../common'

export default class UsersController {
  constructor (public readonly user?: User) {}

  async findMany (): Promise<User[]> {
    return await prisma.user.findMany()
  }

  async create ({ username, email, password }: { username: string, email: string, password: string }): Promise<User> {
    const data: Prisma.UserCreateInput = {
      username,
      email,
      password: await scrypt.hash(password),
      stripeCustomerId: '',
      stripeAccountId: ''
    }
    return await prisma.$transaction(async (tx) => {
      const { id } = await tx.user.create({ data })
      const [account, customer] = await Promise.all([
        stripe.accounts.create({
          type: 'express',
          country: 'US',
          email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true }
          },
          metadata: { id }
        }),
        stripe.customers.create({
          email,
          metadata: { id }
        })
      ])
      return await tx.user.update({
        where: { id },
        data: {
          stripeAccountId: account.id,
          stripeCustomerId: customer.id
        }
      })
    })
  }

  async findOne (id: User['id']): Promise<User> {
    return await prisma.user.findUniqueOrThrow({ where: { id } })
  }

  async updateOne (id: User['id'], data: Partial<User>): Promise<User> {
    if (!this.canEdit(id)) {
      throw new ForbiddenError()
    }
    if (data.password != null) {
      data.password = await scrypt.hash(data.password)
    }
    if (data.paymentCardId != null) {
      const { card } = await stripe.paymentMethods.retrieve(data.paymentCardId)
      data.paymentCardLast4 = card?.last4
      data.paymentCardBrand = card?.brand
      data.paymentCardExpMonth = card?.exp_month
      data.paymentCardExpYear = card?.exp_year
    }
    // if (data.role != null && !this.isSuperUser) {
    //   throw new ForbiddenError()
    // }
    const user = await prisma.user.update({ where: { id }, data })
    await this.updateStripe(id, data)
    return user
  }

  async deleteOne (id: User['id']): Promise<void> {
    if (this.canEdit(id)) {
      const customer = await this.getStripeCustomerId(id)
      await Promise.all([
        prisma.user.delete({ where: { id } }),
        stripe.customers.del(customer)
      ])
    } else {
      throw new ForbiddenError()
    }
  }

  async putImage (id: User['id'], image: UploadedFile): Promise<User> {
    if (!this.canEdit(id)) {
      throw new ForbiddenError()
    }
    const { username } = await prisma.user.findUniqueOrThrow({
      select: { username: true },
      where: { id }
    })
    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET as string,
      Key: `users/${encodeURIComponent(username)}${extname(image.name)}`,
      Body: image.data,
      ACL: 'public-read'
    }
    const result = await s3.upload(params).promise()
    return await prisma.user.update({ where: { id }, data: { imageUrl: result.Location } })
  }

  async getSetupIntent (id: User['id']): Promise<Stripe.SetupIntent> {
    const customer = await this.getStripeCustomerId(id)
    return await stripe.setupIntents.create({ customer })
  }

  private get isSuperUser (): boolean {
    return this.user != null && this.user.role === UserRole.SUPER_USER
  }

  private canEdit (id: User['id']): boolean {
    return this.user != null && (this.user.id === id || this.user.role === UserRole.SUPER_USER)
  }

  private async updateStripe (id: User['id'], data: Partial<User>): Promise<void> {
    const stripeData: Stripe.CustomerUpdateParams = {}
    if (data.email != null) {
      stripeData.email = data.email
    }
    if (data.phone != null) {
      stripeData.phone = data.phone
    }
    if (data.addressLine1 != null && data.addressCity != null && data.addressState != null && data.addressPostalCode != null && data.addressCountry != null) {
      stripeData.address = {
        line1: data.addressLine1,
        line2: data.addressLine2 ?? undefined,
        city: data.addressCity,
        state: data.addressState,
        postal_code: data.addressPostalCode,
        country: data.addressCountry
      }
    }
    if (data.paymentCardId != null) {
      const customer = await this.getStripeCustomerId(id)
      const cardsToRemove = (await stripe.paymentMethods.list({ customer, type: 'card' })).data.filter(card => card.id !== data.paymentCardId)
      await Promise.all(cardsToRemove.map(async card => await stripe.paymentMethods.detach(card.id)))
    }
    if (Object.keys(stripeData).length > 0) {
      const customer = await this.getStripeCustomerId(id)
      await stripe.customers.update(customer, stripeData)
    }
  }

  private async getStripeCustomerId (id: User['id']): Promise<User['stripeCustomerId']> {
    const { stripeCustomerId: customer } = await prisma.user.findUniqueOrThrow({ select: { stripeCustomerId: true }, where: { id } })
    return customer
  }
}
