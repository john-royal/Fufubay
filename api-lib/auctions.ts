import { Auction, AuctionStatus, Bid, BidStatus, Prisma, User } from '@prisma/client'
import { BadRequestError, ForbiddenError, InternalServerError } from 'api-lib/common/errors'
import prisma from 'api-lib/common/prisma'
import { File } from 'formidable'
import { readFile } from 'fs/promises'
import { extname } from 'path'
import s3 from './common/s3'
import stripe from './common/stripe'
import { getSellerAccount } from './users'

export async function isAuthorized (userId: User['id'], auctionId: Auction['id']): Promise<boolean> {
  const { sellerId } = await prisma.auction.findUniqueOrThrow({
    select: { sellerId: true },
    where: { id: auctionId }
  })
  return userId === sellerId
}

export interface CreateAuctionInput { title: string, subtitle: string, description: string, startsAt: Date, endsAt: Date, sellerId: User['id'] }

export async function createAuction ({ title, subtitle, description, startsAt, endsAt, sellerId }: CreateAuctionInput): Promise<Auction> {
  const { charges_enabled: chargesEnabled } = await getSellerAccount(sellerId)
  if (!chargesEnabled) {
    throw new ForbiddenError('Your account does not have a payout account set up.')
  }
  const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  const canceledSimilarItemCount = await prisma.auction.count({
    where: {
      OR: { title, description, slug },
      status: AuctionStatus.CANCELED
    }
  })
  if (canceledSimilarItemCount > 0) {
    throw new BadRequestError('This item has been banned. For more information, contact a super user.')
  }
  if (startsAt.getTime() <= Date.now()) {
    throw new BadRequestError('The start date must be in the future.')
  }
  if (endsAt.getTime() <= startsAt.getTime()) {
    throw new BadRequestError('The end date must be after the start date.')
  }
  if (endsAt.getTime() - startsAt.getTime() >= (7 * 86400 * 1000)) {
    throw new BadRequestError('The auction cannot be longer than 7 days.')
  }
  return await prisma.auction.create({
    data: {
      title,
      subtitle,
      description,
      slug,
      startsAt,
      endsAt,
      seller: { connect: { id: sellerId } }
    }
  })
}

export interface AuctionGetInput { sellerId?: User['id'], status?: AuctionStatus, search?: string }

export async function getAuctions ({ sellerId, status, search }: AuctionGetInput): Promise<Auction[]> {
  const where: Prisma.AuctionWhereInput = { sellerId, status }
  if (search != null) {
    search = normalizeSearch(search)
    where.OR = {
      title: { search },
      description: { search }
    }
  }
  return await prisma.auction.findMany({ where, orderBy: { createdAt: 'desc' } })
}

function normalizeSearch (query: string): string {
  const parts = query.split(/\s+/)
  if (parts.length > 1) {
    return parts
      .map(term => `'${term}'`)
      .join('&')
  } else {
    return query
  }
}

export interface FinalizeAuctionInput { winningBidId: Bid['id']}

export async function finalizeAuction (id: Auction['id'], { winningBidId }: FinalizeAuctionInput): Promise<void> {
  const { bids } = await prisma.auction.findUniqueOrThrow({
    select: { bids: true },
    where: { id }
  })
  const winner = bids.find(bid => bid.id === winningBidId)
  const losers = bids.filter(bid => bid.id !== winningBidId)
  if (winner == null) {
    throw new InternalServerError(`Cannot find winning bid ${winningBidId} in auction ${id}`)
  }
  await prisma.$transaction(async (tx) => {
    await Promise.all([
      stripe.paymentIntents.capture(winner.stripeId),
      tx.bid.update({ data: { status: BidStatus.WIN }, where: { id: winner.id } }),
      tx.auction.update({ data: { status: AuctionStatus.SOLD }, where: { id } })
    ])
  })
  await prisma.bid.updateMany({
    data: {
      status: BidStatus.LOSE
    },
    where: {
      AND: {
        auctionId: id,
        id: { not: winner.id }
      }
    }
  })
  await Promise.all(losers.map(async bid => await stripe.paymentIntents.cancel(bid.stripeId)))
}

export async function putImage (id: Auction['id'], image: File): Promise<Auction> {
  const { slug } = await prisma.auction.findUniqueOrThrow({
    select: { slug: true },
    where: { id }
  })
  const params: AWS.S3.PutObjectRequest = {
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: `auctions/${id}/${encodeURIComponent(slug)}${extname(image.originalFilename as string)}`,
    Body: await readFile(image.filepath),
    ACL: 'public-read'
  }
  const result = await s3.upload(params).promise()
  return await prisma.auction.update({ where: { id }, data: { imageUrl: result.Location } })
}

export async function patchAuction (id: Auction['id'], data: Partial<Auction>): Promise<Auction> {
  return await prisma.auction.update({
    data,
    where: { id }
  })
}
