import { Prisma, User, UserRole } from '@prisma/client'
import prisma from 'api-lib/common/prisma'
import s3 from 'api-lib/common/s3'
import stripe from 'api-lib/common/stripe'
import { hash } from 'argon2'
import { File } from 'formidable'
import { readFile } from 'fs/promises'
import { extname } from 'path'
import Stripe from 'stripe'

type UserSelectInput = Prisma.UserSelect & { rating?: boolean }

export async function getUser<T extends UserSelectInput> (id: User['id'], select?: T): Promise<User & (T extends { rating: true } ? { rating: number | null } : {})> {
  const isRatingSelected = select?.rating === true
  delete select?.rating // prevents this from messing with Prisma
  const user = await prisma.user.findUniqueOrThrow({
    select: Object.keys(select ?? {}).length > 0 ? select : undefined,
    where: { id }
  }) as User
  if (isRatingSelected) {
    const rating = await getSellerRating(id)
    return Object.assign(user, { rating })
  } else {
    return user as User & { rating: null }
  }
}

export async function getSetupIntent (id: User['id']): Promise<Stripe.SetupIntent> {
  const { stripeCustomerId } = await prisma.user.findUniqueOrThrow({
    select: { stripeCustomerId: true },
    where: { id }
  })
  return await stripe.setupIntents.create({ customer: stripeCustomerId })
}

export async function getSellerAccount (id: User['id']): Promise<Stripe.Account> {
  const { stripeAccountId } = await prisma.user.findUniqueOrThrow({
    select: { stripeAccountId: true },
    where: { id }
  })
  return await stripe.accounts.retrieve({
    stripeAccount: stripeAccountId
  })
}

export async function getSellerRating (id: User['id']): Promise<number | null> {
  return prisma.review.aggregate({
    _avg: { rating: true },
    where: { sellerId: id }
  })
    .then(result => result._avg.rating)
}

export async function getSellerLoginLink (id: User['id']): Promise<{ url: string }> {
  const account = await getSellerAccount(id)
  if (account.charges_enabled) {
    return await stripe.accounts.createLoginLink(account.id)
  } else {
    return await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      return_url: 'http://localhost:8080/account/settings',
      refresh_url: `http://localhost:8080/api/users/${id}/seller-login`
    })
  }
}

export interface PatchUserInput {
  username?: string
  email?: string
  phone?: string
  password?: string
  bio?: string
  imageUrl?: string
  role?: UserRole
}

export async function patchUser (id: User['id'], data: PatchUserInput): Promise<User> {
  if (typeof data.password === 'string') {
    data.password = await hash(data.password)
  }
  const user = await prisma.user.update({ data, where: { id } })
  if (typeof data.email === 'string' || typeof data.password === 'string') {
    await stripe.customers.update(user.stripeCustomerId, {
      email: data.email,
      phone: data.phone
    })
  }
  return user
}

export interface PostUserInput { username: string, email: string, password: string }

export async function postUser ({ username, email, password }: PostUserInput): Promise<User> {
  const data: Prisma.UserCreateInput = {
    username,
    email,
    password: await hash(password),
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

export interface PutAddressInput {
  addressLine1: string
  addressLine2: string | null
  addressCity: string
  addressState: string
  addressPostalCode: string
  addressCountry: string

}

export async function putAddress (id: User['id'], data: PutAddressInput): Promise<User> {
  return await prisma.$transaction(async (tx) => {
    const user = await prisma.user.update({ data, where: { id } })
    await stripe.customers.update(user.stripeCustomerId, {
      address: {
        line1: data.addressLine1,
        line2: data.addressLine2 ?? undefined,
        city: data.addressCity,
        state: data.addressState,
        postal_code: data.addressPostalCode,
        country: data.addressCountry
      }
    })
    return user
  })
}

export async function putImage (id: User['id'], image: File): Promise<User> {
  const { username } = await prisma.user.findUniqueOrThrow({
    select: { username: true },
    where: { id }
  })
  const params: AWS.S3.PutObjectRequest = {
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: `users/${encodeURIComponent(username)}${extname(image.originalFilename as string)}`,
    Body: await readFile(image.filepath),
    ACL: 'public-read'
  }
  const result = await s3.upload(params).promise()
  return await prisma.user.update({ where: { id }, data: { imageUrl: result.Location } })
}

export interface PutPaymentCardInput {
  paymentCardId: string
}

export async function putPaymentCard (id: User['id'], { paymentCardId }: PutPaymentCardInput): Promise<User> {
  const { card } = await stripe.paymentMethods.retrieve(paymentCardId)
  const data: Prisma.UserUpdateInput = {
    paymentCardId,
    paymentCardLast4: card?.last4,
    paymentCardBrand: card?.brand,
    paymentCardExpMonth: card?.exp_month,
    paymentCardExpYear: card?.exp_year
  }
  const user = await prisma.user.update({ data, where: { id } })
  await stripe.paymentMethods.list({
    customer: user.stripeCustomerId,
    type: 'card'
  })
    .then(paymentMethods => paymentMethods.data.filter(card => card.id !== paymentCardId))
    .then(async cards => await Promise.all(
      cards.map(async card => await stripe.paymentMethods.detach(card.id))
    ))
  return user
}
