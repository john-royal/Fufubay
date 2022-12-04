import { Auction, AuctionStatus, Prisma, User, UserRole } from '@prisma/client'
import { UploadedFile } from 'express-fileupload'
import { extname } from 'path'
import { ForbiddenError, UnauthorizedError, prisma, s3, stripe } from '../common'

export default class AuctionsController {
  constructor (private readonly user?: User) {}

  async findMany ({ where: { status, sellerId, search } }: { where: { status?: AuctionStatus[], sellerId?: Auction['sellerId'], search?: string } }): Promise<Auction[]> {
    const where: Prisma.AuctionWhereInput = {
      status: status != null ? { in: status } : AuctionStatus.LIVE,
      sellerId
    }
    if (search != null) {
      search = this.normalizeSearch(search)
      where.OR = {
        title: { search },
        description: { search }
      }
    }
    return await prisma.auction.findMany({ where, orderBy: { createdAt: 'desc' } })
  }

  async findOne (id: Auction['id'], include: { bids: boolean, seller: boolean }): Promise<Auction> {
    const auction = await prisma.auction.findUniqueOrThrow({
      where: { id },
      include: {
        bids: include.bids
          ? {
              include: { user: true },
              orderBy: { date: 'desc' }
            }
          : false,
        seller: include.seller
      }
    })
    if (this.canView(auction)) {
      return auction
    } else {
      throw new ForbiddenError()
    }
  }

  async updateOne (id: Auction['id'], data: Partial<Auction>): Promise<Auction> {
    const { sellerId } = await prisma.auction.findUniqueOrThrow({
      select: { sellerId: true },
      where: { id }
    })
    if (this.canEdit({ sellerId }) && (data.status == null || this.user?.role === UserRole.SUPER_USER)) {
      return await prisma.auction.update({
        where: { id },
        data
      })
    } else {
      throw new ForbiddenError()
    }
  }

  async deleteOne (id: Auction['id']): Promise<void> {
    const { sellerId } = await prisma.auction.findUniqueOrThrow({
      select: { sellerId: true },
      where: { id }
    })
    if (this.canEdit({ sellerId })) {
      await prisma.auction.delete({ where: { id } })
    } else {
      throw new ForbiddenError()
    }
  }

  async putImage (id: Auction['id'], image: UploadedFile): Promise<Auction> {
    const { slug, sellerId } = await prisma.auction.findUniqueOrThrow({
      select: { slug: true, sellerId: true },
      where: { id }
    })
    if (!this.canEdit({ sellerId })) {
      throw new ForbiddenError()
    }
    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET as string,
      Key: `auctions/${id}/${slug}${extname(image.name)}`,
      Body: image.data,
      ACL: 'public-read'
    }
    const result = await s3.upload(params).promise()
    return await prisma.auction.update({ where: { id }, data: { imageUrl: result.Location } })
  }

  async create ({ title, description, sellerId }: { title: string, description: string, sellerId: number }): Promise<Auction> {
    if (this.user == null || this.user.id !== sellerId) {
      throw new UnauthorizedError()
    } else if (this.user.role === UserRole.PENDING_REVIEW) {
      throw new ForbiddenError('Your account hasn’t been approved yet.')
    }
    const account = await stripe.accounts.retrieve({ stripeAccount: this.user.stripeAccountId })
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

  private canView (auction: Auction): boolean {
    const isPublic = auction.status === AuctionStatus.LIVE || auction.status === AuctionStatus.SOLD
    const isAuthorized = this.user?.role === UserRole.SUPER_USER || this.user?.id === auction?.sellerId
    return isPublic || isAuthorized
  }

  private canEdit (auction: { sellerId: Auction['sellerId'] }): boolean {
    if (this.user == null || this.user.role === UserRole.PENDING_REVIEW) {
      return false
    } else if (this.user.role === UserRole.SUPER_USER) {
      return true
    } else {
      return this.user.id === auction.sellerId
    }
  }

  private normalizeSearch (query: string): string {
    const parts = query.split(/\s+/)
    if (parts.length > 1) {
      return parts
        .map(term => `'${term}'`)
        .join('&')
    } else {
      return query
    }
  }
}
