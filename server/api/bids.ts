import { Bid, Prisma } from '@prisma/client'
import prisma from '../prisma'
import stripe from '../stripe'
import router from './router'

export default router([
  {
    method: 'get',
    path: '/',
    async handler (req, res) {
      const where: Prisma.BidWhereInput = {}
      if (typeof req.query.auctionId === 'string') {
        where.auctionId = parseInt(req.query.auctionId)
      }
      if (typeof req.query.userId === 'string') {
        where.userId = parseInt(req.query.userId)
      }

      const include: Prisma.BidInclude = {}
      if (typeof req.query.include === 'string') {
        const properties = req.query.include.split(',') as Array<keyof Prisma.BidInclude>
        for (const property of properties) {
          include[property] = true
        }
      }

      const bids = await prisma.bid.findMany({
        where,
        include,
        orderBy: { date: 'desc' }
      })
      return res.success(bids)
    }
  },
  {
    method: 'post',
    path: '/',
    async handler (req, res) {
      const { amount, auctionId } = req.body as Bid
      const user = req.session.user
      if (user == null) {
        return res.unauthorized()
      }
      const { _max: { amount: minimumAmount } } = await prisma.bid.aggregate({
        _max: { amount: true },
        where: { auctionId }
      })
      if (amount <= (minimumAmount ?? 0)) {
        return res.badRequest(`You must bid at least $${String(minimumAmount ?? 0)}.`)
      }
      const { data: paymentCards } = await stripe.paymentMethods.list({
        customer: user.stripeId,
        type: 'card'
      })
      if (paymentCards.length === 0) {
        return res.badRequest('Please add a payment card to your account.')
      }
      // TODO: Save Payment Intent ID to use for confirmation.
      const paymentIntent = await stripe.paymentIntents.create({
        customer: user.stripeId,
        amount: amount * 1000,
        currency: 'usd',
        capture_method: 'manual',
        payment_method: paymentCards[0].id,
        confirm: true
      })
      const data: Prisma.BidCreateInput = {
        amount,
        stripeId: paymentIntent.id,
        auction: {
          connect: {
            id: req.body.auctionId
          }
        },
        user: {
          connect: {
            id: user.id
          }
        }
      }
      const bid = await prisma.bid.create({ data })
      return res.success(bid)
    }
  }
])
