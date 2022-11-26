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
      if (typeof req.query.auctionID === 'string') {
        where.auctionID = parseInt(req.query.auctionID)
      }
      if (typeof req.query.userID === 'string') {
        where.userID = parseInt(req.query.userID)
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
      const { amount, auctionID } = req.body as Bid
      const user = req.session.user
      if (user == null) {
        return res.unauthorized()
      }
      const { _max: { amount: minimumAmount } } = await prisma.bid.aggregate({
        _max: { amount: true },
        where: { auctionID }
      })
      if (amount <= (minimumAmount ?? 0)) {
        return res.badRequest(`You must bid at least $${minimumAmount ?? 0}.`)
      }
      const { data: paymentCards } = await stripe.paymentMethods.list({
        customer: user.stripeCustomerID,
        type: 'card'
      })
      if (paymentCards.length === 0) {
        return res.badRequest('Please add a payment card to your account.')
      }
      // TODO: Save Payment Intent ID to use for confirmation.
      await stripe.paymentIntents.create({
        customer: user.stripeCustomerID,
        amount: amount * 1000,
        currency: 'usd',
        capture_method: 'manual',
        payment_method: paymentCards[0].id,
        confirm: true
      })
      const data: Prisma.BidCreateInput = {
        amount,
        auction: {
          connect: {
            id: req.body.auctionID
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
