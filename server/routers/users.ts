import { Prisma, UserRole } from '@prisma/client'
import { Router } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import normalizeEmail from 'normalize-email'
import { extname } from 'path'
import Stripe from 'stripe'
import { Address, User } from '../../shared/types'
import s3 from '../s3'
import prisma from '../prisma'
import stripe from '../stripe'
import { hash } from '../util/scrypt'
import { withHandler } from './router'

const canEdit = (user: User | undefined, id: User['id']): boolean => {
  if (user == null) return false
  else if (user.role === UserRole.SUPER_USER) return true
  else return user.id === id
}

const router = Router()

router.get('/', withHandler(async function (req, res) {
  const users = await prisma.user.findMany()
  return res.success(users)
}))

router.post('/', withHandler(async function (req, res) {
  const { username, email, password } = {
    username: req.body.username as string,
    email: normalizeEmail(req.body.email),
    password: await hash(req.body.password)
  }
  const { id: stripeId } = await stripe.customers.create({
    email
  })
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
      stripeId,
      role: UserRole.ORDINARY_USER // TODO: remove when admin approval functionality is added
    }
  }) as unknown as User
  await req.signIn(user)
  return res.created(user)
}))

router.get('/:id', withHandler(async function (req, res) {
  const id = req.params.id === 'me' ? req.session.user?.id : parseInt(req.params.id)
  if (id == null) {
    return res.badRequest()
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id }
  })
  if (user == null) {
    return res.notFound()
  }
  return res.success(user)
}))

router.patch('/:id', withHandler(async function (req, res) {
  const id = parseInt(req.params.id)
  if (!canEdit(req.session.user, id)) {
    return res.unauthorized()
  }
  const dbData: Prisma.UserUpdateInput = {}
  const stripeData: Stripe.CustomerUpdateParams = {}
  const { stripeId } = await prisma.user.findUniqueOrThrow({ select: { stripeId: true }, where: { id } })
  for (const property of ['id', 'createdAt', 'stripeId', 'auctions', 'bids']) {
    if (property in req.body) {
      return res.badRequest(`Cannot update property "${property}" of user`)
    }
  }
  if ('username' in req.body) {
    dbData.username = req.body.username
  }
  if ('email' in req.body) {
    dbData.email = normalizeEmail(req.body.email)
    stripeData.email = dbData.email
  }
  if ('password' in req.body) {
    dbData.password = await hash(req.body.password)
  }
  if ('bio' in req.body) {
    dbData.bio = req.body.bio
  }
  if ('imageUrl' in req.body) {
    dbData.imageUrl = req.body.imageUrl
  }
  if ('address' in req.body) {
    const { line1, line2, city, state, postalCode, countryCode } = req.body.address as Address
    dbData.address = { line1, line2, city, state, postalCode, countryCode }
    stripeData.address = { line1, line2, city, state, postal_code: postalCode, country: countryCode }
  }
  if ('paymentCard' in req.body) {
    const id = req.body.paymentCard.id as string
    dbData.paymentCard = await (async () => {
      const paymentMethod = await stripe.paymentMethods.retrieve(id)
      const { brand, last4, exp_month: expMonth, exp_year: expYear } = paymentMethod.card as Stripe.PaymentMethod.Card
      return {
        id: paymentMethod.id,
        brand: brand[0].toUpperCase() + brand.slice(1),
        last4,
        expMonth,
        expYear
      }
    })()
    const paymentCardsToRemove = (await stripe.paymentMethods.list({
      customer: stripeId,
      type: 'card'
    }))
      .data.filter(card => card.id !== id)
    await Promise.all(paymentCardsToRemove.map(async card => {
      await stripe.paymentMethods.detach(card.id)
    }))
  }
  if ('role' in req.body) {
    if (req.session.user?.role !== UserRole.SUPER_USER) {
      return res.unauthorized()
    }
    dbData.role = req.body.role as UserRole
  }
  const user = await prisma.user.update({ data: dbData, where: { id } })
  if (Object.keys(stripeData).length > 0) {
    await stripe.customers.update(stripeId, stripeData)
  }
  await req.signIn(user as unknown as User)
  return res.success(user)
}))

router.put('/:id/image', fileUpload(), withHandler(async (req, res) => {
  const id = parseInt(req.params.id)
  if (req.session.user == null || id !== req.session.user.id) {
    return res.unauthorized()
  }
  const image = req.files?.image as UploadedFile
  const params: AWS.S3.PutObjectRequest = {
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: `users/${encodeURIComponent(req.session.user.username)}${extname(image.name)}`,
    Body: image.data,
    ACL: 'public-read'
  }
  const result = await s3.upload(params).promise()
  const user = await prisma.user.update({ where: { id }, data: { imageUrl: result.Location } })
  await req.signIn(user as unknown as User)
  return res.success(null)
}))

router.delete('/:id', withHandler(async function (req, res) {
  const id = parseInt(req.params.id)
  if (req.session.user == null || id !== req.session.user.id) {
    return res.unauthorized()
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id }
  })
  await Promise.all([
    prisma.user.delete({ where: { id } }),
    stripe.customers.del(user.stripeId)
  ])
  return res.success(null)
}))

router.post('/:id/setup-intents', withHandler(async function (req, res) {
  const id = parseInt(req.params.id)
  if (req.session.user == null || id !== req.session.user.id) {
    return res.unauthorized()
  }
  const setupIntent = await stripe.setupIntents.create({
    customer: req.session.user.stripeId
  })
  return res.success({ setupIntent })
}))

router.delete('/:id/setup-intents/:intentId', withHandler(async function (req, res) {
  const id = parseInt(req.params.id)
  if (req.session.user == null || id !== req.session.user.id) {
    return res.unauthorized()
  }
  await stripe.setupIntents.cancel(req.params.intentId)
  return res.success(null)
}))

export default router
