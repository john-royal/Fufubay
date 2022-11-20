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
      const { name, email, password } = {
        name: req.body.name as string,
        email: normalizeEmail(req.body.email),
        password: await hash(req.body.password)
      }
      const stripeCustomer = await stripe.customers.create({
        name,
        email
      })
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password,
          stripeCustomerId: stripeCustomer.id
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
      if (id === req.user?.id) {
        const stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerId)
        Object.assign(user, { stripeCustomer })
      }
      return res.success(user)
    }
  },
  // TODO: Add update route.
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
        stripe.customers.del(user.stripeCustomerId)
      ])
      return res.success(null)
    }
  }
])
