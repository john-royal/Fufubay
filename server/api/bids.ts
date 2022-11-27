import { Bid, Prisma } from '@prisma/client'
import { Router } from 'express'
import prisma from '../prisma'
import stripe from '../stripe'
import { withHandler } from './router'

const router = Router()

router.get('/', withHandler(async function (req, res) {
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
}))

router.post('/', withHandler(async function (req, res) {
  const { amount, auctionId, userId } = req.body as Bid
  if (req.session.user == null || req.session.user.id !== userId) {
    return res.unauthorized()
  }
  const minimumAmount = await (async () => {
    const result = await prisma.bid.aggregate({
      _max: { amount: true },
      where: { auctionId }
    })
    return result._max.amount ?? 0
  })()
  if (amount <= minimumAmount) {
    return res.badRequest(`You must bid at least $${minimumAmount}.`)
  }
  const { paymentCard } = req.session.user
  if (paymentCard == null) {
    return res.badRequest('Please add a payment card to your account.')
  }
  const paymentIntent = await stripe.paymentIntents.create({
    customer: req.session.user.stripeId,
    amount: amount * 1000,
    currency: 'usd',
    capture_method: 'manual',
    payment_method: paymentCard.id,
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
        id: userId
      }
    }
  }
  const bid = await prisma.bid.create({ data })
  return res.success(bid)
}))

export default router
