import { AuctionStatus, Bid, User, UserRole } from '@prisma/client'
import { BadRequestError, ForbiddenError, prisma, stripe, UnauthorizedError } from '../common'

export default class BidsController {
  constructor (private readonly user?: User, private readonly time: number = Date.now()) {}

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
    const {
      status,
      startsAt,
      endsAt,
      seller,
      highBid
    } = await this.fetchAuctionInformation(auctionId)
    if (
      status !== AuctionStatus.LIVE ||
      startsAt == null ||
      endsAt == null ||
      this.time < startsAt.getTime() ||
      this.time > endsAt.getTime()
    ) {
      throw new BadRequestError('This auction is not open for bidding.')
    } else if (amount < highBid) {
      throw new BadRequestError(`You must bid more than $${highBid}.`)
    }
    const paymentIntent = await stripe.paymentIntents.create({
      customer: this.user.stripeCustomerId,
      amount: amount * 100, // Convert dollars to cents per Stripe requirements.
      currency: 'usd',
      capture_method: 'manual',
      payment_method: this.user.paymentCardId,
      confirm: true,
      transfer_data: {
        destination: seller.stripeAccountId
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

  private async fetchAuctionInformation (auctionId: Bid['auctionId']): Promise<{
    status: AuctionStatus
    startsAt: Date | null
    endsAt: Date | null
    seller: { stripeAccountId: string }
    highBid: number
  }> {
    const [{ status, startsAt, endsAt, seller }, highBid] = await Promise.all([
      prisma.auction.findUniqueOrThrow({
        select: {
          status: true,
          startsAt: true,
          endsAt: true,
          seller: { select: { stripeAccountId: true } }
        },
        where: { id: auctionId }
      }),
      prisma.bid
        .aggregate({
          _max: { amount: true },
          where: { auctionId }
        })
        .then(({ _max }) => _max.amount ?? 0)
    ])
    return { status, startsAt, endsAt, seller, highBid }
  }
}
