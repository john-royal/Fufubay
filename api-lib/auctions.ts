import { Auction, AuctionStatus, Bid, BidStatus, Prisma, User } from '@prisma/client'
import { ForbiddenError, InternalServerError } from 'api-lib/common/errors'
import prisma from 'api-lib/common/prisma'
import { getSellerAccount } from 'api-lib/users'
import { File } from 'formidable'
import { readFile } from 'fs/promises'
import { extname } from 'path'
import s3 from './common/s3'
import stripe from './common/stripe'

export async function isAuthorized (userId: User['id'], auctionId: Auction['id']): Promise<boolean> {
  const { sellerId } = await prisma.auction.findUniqueOrThrow({
    select: { sellerId: true },
    where: { id: auctionId }
  })
  return userId === sellerId
}

export interface CreateAuctionInput {title: string, description: string, sellerId: User['id']}

export async function createAuction ({ title, description, sellerId }: CreateAuctionInput): Promise<Auction> {
  const account = await getSellerAccount(sellerId)
  if (!account.charges_enabled) {
    throw new ForbiddenError('Your account does not have a payout account set up.')
  }
  const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  return await prisma.auction.create({
    data: {
      title,
      description,
      slug,
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
