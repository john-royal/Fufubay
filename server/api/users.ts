import { User } from '@prisma/client'
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
          stripeCustomerID: stripeCustomer.id
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
      const id = parseInt(req.params.id)
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
      if (req.user == null || id !== req.user.id) {
        return res.unauthorized()
      }
      if (typeof req.body.password === 'string') {
        req.body.password = await hash(req.body.password)
      }
      const user = await prisma.user.update({
        where: { id },
        data: req.body as User
      })
      await req.signIn(user)
      return res.success(user)
    }
  },
  {
    method: 'delete',
    path: '/:id',
    async handler (req, res) {
      const id = parseInt(req.params.id)
      if (req.user == null || id !== req.user.id) {
        return res.unauthorized()
      }
      const user = await prisma.user.findUniqueOrThrow({
        where: { id }
      })
      await Promise.all([
        prisma.user.delete({ where: { id } }),
        stripe.customers.del(user.stripeCustomerID)
      ])
      return res.success(null)
    }
  },
  {
    method: 'post',
    path: '/:id/setup-intents',
    async handler (req, res) {
      const id = parseInt(req.params.id)
      if (req.user == null || id !== req.user.id) {
        return res.unauthorized()
      }
      const [customer, setupIntent] = await Promise.all([
        stripe.customers.retrieve(req.user.stripeCustomerID),
        stripe.setupIntents.create({
          customer: req.user.stripeCustomerID
        })
      ])
      return res.success({ customer, setupIntent })
    }
  }
])
