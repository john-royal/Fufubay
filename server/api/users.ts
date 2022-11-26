import { Prisma } from '@prisma/client'
import normalizeEmail from 'normalize-email'
import prisma from '../prisma'
import stripe from '../stripe'
import { hash } from '../util/scrypt'
import router from './router'

export default router([
  {
    method: 'get',
    path: '/',
    async handler (req, res) {
      const users = await prisma.user.findMany()
      return res.success(users)
    }
  },
  {
    method: 'post',
    path: '/',
    async handler (req, res) {
      const { username, email, password } = {
        username: req.body.username as string,
        email: normalizeEmail(req.body.email),
        password: await hash(req.body.password)
      }
      const stripeCustomer = await stripe.customers.create({
        email
      })
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password,
          stripeId: stripeCustomer.id
        }
      })
      await req.signIn(user)
      return res.created(user)
    }
  },
  {
    method: 'get',
    path: '/:id',
    async handler (req, res) {
      const id = req.params.id === 'me' ? req.session.user?.id : parseInt(req.params.id)
      if (id == null) {
        return res.badRequest()
      }
      const user = await prisma.user.findUnique({
        where: { id }
      })
      if (user == null) {
        return res.notFound()
      }
      return res.success(user)
    }
  },
  {
    method: 'patch',
    path: '/:id',
    async handler (req, res) {
      const id = parseInt(req.params.id)
      if (req.session.user == null || id !== req.session.user.id) {
        return res.unauthorized()
      }
      if (typeof req.body.password === 'string') {
        req.body.password = await hash(req.body.password)
      }
      const user = await prisma.user.update({
        where: { id },
        data: req.body as Prisma.UserUpdateInput
      })
      if (typeof req.body.email === 'string') {
        await stripe.customers.update(user.stripeId, { email: user.email })
      }
      await req.signIn(user)
      return res.success(user)
    }
  },
  {
    method: 'delete',
    path: '/:id',
    async handler (req, res) {
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
    }
  },
  {
    method: 'get',
    path: '/:id/stripe',
    async handler (req, res) {
      const id = parseInt(req.params.id)
      if (req.session.user == null || id !== req.session.user.id) {
        return res.unauthorized()
      }
      const [customer, paymentMethods] = await Promise.all([
        stripe.customers.retrieve(req.session.user.stripeId),
        stripe.customers.listPaymentMethods(req.session.user.stripeId, { type: 'card' })
      ])
      return res.success({ user: req.session.user, customer, paymentMethods })
    }
  },
  {
    method: 'patch',
    path: '/:id/stripe',
    async handler (req, res) {
      const id = parseInt(req.params.id)
      if (req.session.user == null || id !== req.session.user.id) {
        return res.unauthorized()
      }
      const customer = await stripe.customers.update(req.session.user.stripeId, req.body)
      return res.success(customer)
    }
  },
  {
    method: 'post',
    path: '/:id/setup-intents',
    async handler (req, res) {
      const id = parseInt(req.params.id)
      if (req.session.user == null || id !== req.session.user.id) {
        return res.unauthorized()
      }
      const setupIntent = await stripe.setupIntents.create({
        customer: req.session.user.stripeId
      })
      return res.success({ setupIntent })
    }
  }
])
