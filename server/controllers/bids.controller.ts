import { Bid, UserRole } from '@prisma/client'
import { User } from '../../shared/types'
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../errors'
import prisma from '../prisma'
import stripe from '../stripe'

export default class BidsController {
  async findMany ({
    where: { auctionId, userId },
    include: { auction, user }
  }: {
    where: { auctionId: number | undefined, userId: number | undefined }
    include: { auction: boolean, user: boolean }
  }): Promise<Bid[]> {
    return await prisma.bid.findMany({
      where: { auctionId, userId },
      include: { auction, user },
      orderBy: { date: 'desc' }
    })
  }

  async create ({ amount, auctionId, userId }: { amount: number, auctionId: Bid['auctionId'], userId: Bid['userId'] }, user?: User): Promise<Bid> {
    if (user == null || user.id !== userId) {
      throw new UnauthorizedError()
    } else if (user.paymentCard == null) {
      throw new BadRequestError('Please add a payment card to your account.')
    } else if (user.role === UserRole.PENDING_REVIEW) {
      throw new ForbiddenError('Your account hasn’t been approved yet.')
    }
    const highBid = await prisma.bid
      .aggregate({
        _max: { amount: true },
        where: { auctionId }
      })
      .then(({ _max }) => _max.amount ?? 0)
    if (amount <= highBid) {
      throw new BadRequestError(`You must bid more than $${highBid}.`)
    }
    const paymentIntent = await stripe.paymentIntents.create({
      customer: user.stripeId,
      amount: amount * 1000,
      currency: 'usd',
      capture_method: 'manual',
      payment_method: user.paymentCard.id,
      confirm: true
    })
    return await prisma.bid.create({
      data: {
        amount,
        stripeId: paymentIntent.id,
        auction: { connect: { id: auctionId } },
        user: { connect: { id: userId } }
      }
    })
  }
}
