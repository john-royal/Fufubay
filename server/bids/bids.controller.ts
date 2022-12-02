import { Bid, User, UserRole } from '@prisma/client'
import { BadRequestError, ForbiddenError, prisma, stripe, UnauthorizedError } from '../common'

export default class BidsController {
  constructor (private readonly user?: User) {}

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

  async create ({ amount, auctionId, userId }: { amount: number, auctionId: Bid['auctionId'], userId: Bid['userId'] }): Promise<Bid> {
    if (this.user == null || this.user.id !== userId) {
      throw new UnauthorizedError()
    } else if (this.user.paymentCardId == null) {
      throw new BadRequestError('Please add a payment card to your account.')
    } else if (this.user.role === UserRole.PENDING_REVIEW) {
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
    const { seller: { stripeAccountId: transferDestinationId } } = await prisma.auction.findUniqueOrThrow({ select: { seller: { select: { stripeAccountId: true } } }, where: { id: auctionId } })
    const paymentIntent = await stripe.paymentIntents.create({
      customer: this.user.stripeCustomerId,
      amount: amount * 1000,
      currency: 'usd',
      capture_method: 'manual',
      payment_method: this.user.paymentCardId,
      confirm: true,
      transfer_data: {
        destination: transferDestinationId
      }
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
