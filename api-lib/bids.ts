import { Auction, AuctionStatus, Bid, User } from '@prisma/client'
import { BadRequestError } from 'api-lib/common/errors'
import prisma from 'api-lib/common/prisma'
import stripe from 'api-lib/common/stripe'

export interface CreateBidInput {
  amount: number
  auctionId: Auction['id']
  userId: User['id']
}

export async function createBid ({ amount, auctionId, userId }: CreateBidInput): Promise<Bid> {
  const [highBid, isOpen, seller, user] = await Promise.all([
    getHighBid(auctionId),
    getIsOpen(auctionId),
    getSellerInformation(auctionId),
    getUserInformation(userId)
  ])
  if (!isOpen) {
    throw new BadRequestError('This auction is not open for bidding.')
  } else if (user.paymentCardId == null) {
    throw new BadRequestError('Please add a payment card to your account.')
  } else if (amount < highBid) {
    throw new BadRequestError(`You must bid more than $${highBid}.`)
  }
  const paymentIntent = await stripe.paymentIntents.create({
    customer: user.stripeCustomerId,
    amount: amount * 100, // Convert dollars to cents per Stripe requirements.
    currency: 'usd',
    capture_method: 'manual',
    payment_method: user.paymentCardId,
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

async function getHighBid (auctionId: Auction['id']): Promise<number> {
  return await prisma.bid
    .aggregate({
      _max: { amount: true },
      where: { auctionId }
    })
    .then(({ _max }) => _max.amount ?? 0)
}

async function getIsOpen (auctionId: Auction['id']): Promise<boolean> {
  const { status, startsAt, endsAt } = await prisma.auction.findUniqueOrThrow({
    select: {
      status: true,
      startsAt: true,
      endsAt: true
    },
    where: { id: auctionId }
  })
  return status === AuctionStatus.LIVE && startsAt != null && endsAt != null && Date.now() < endsAt.getTime()
}

async function getSellerInformation (auctionId: Auction['id']): Promise<{ stripeAccountId: string }> {
  const { seller } = await prisma.auction.findUniqueOrThrow({
    select: {
      seller: {
        select: {
          stripeAccountId: true
        }
      }
    },
    where: { id: auctionId }
  })
  return seller
}

async function getUserInformation (userId: User['id']): Promise<{ paymentCardId: string | null, stripeCustomerId: string }> {
  return await prisma.user.findUniqueOrThrow({
    select: {
      paymentCardId: true,
      stripeCustomerId: true
    },
    where: { id: userId }
  })
}
