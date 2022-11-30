import { Auction, AuctionStatus, Prisma, UserRole } from '@prisma/client'
import { UploadedFile } from 'express-fileupload'
import { extname } from 'path'
import { User } from '../../shared/types'
import { ForbiddenError, UnauthorizedError } from '../errors'
import prisma from '../prisma'
import s3 from '../s3'

export default class AuctionsController {
  async findMany ({ where: { status, sellerId, search } }: { where: { status?: AuctionStatus, sellerId?: Auction['sellerId'], search?: string } }): Promise<Auction[]> {
    const where: Prisma.AuctionWhereInput = {
      status: status ?? AuctionStatus.LIVE,
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

  async findOne (id: Auction['id'], user?: User): Promise<Auction> {
    const auction = await prisma.auction.findUniqueOrThrow({
      where: { id },
      include: { seller: true }
    })
    if (this.canView(user, auction)) {
      return auction
    } else {
      throw new ForbiddenError()
    }
  }

  async updateOne (id: Auction['id'], data: Partial<Auction>, user?: User): Promise<Auction> {
    const { sellerId } = await prisma.auction.findUniqueOrThrow({
      select: { sellerId: true },
      where: { id }
    })
    if (this.canEdit(user, { sellerId })) {
      return await prisma.auction.update({
        where: { id },
        data
      })
    } else {
      throw new ForbiddenError()
    }
  }

  async deleteOne (id: Auction['id'], user?: User): Promise<void> {
    const { sellerId } = await prisma.auction.findUniqueOrThrow({
      select: { sellerId: true },
      where: { id }
    })
    if (this.canEdit(user, { sellerId })) {
      await prisma.auction.delete({ where: { id } })
    } else {
      throw new ForbiddenError()
    }
  }

  async putImage (id: Auction['id'], image: UploadedFile, user?: User): Promise<Auction> {
    const { slug, sellerId } = await prisma.auction.findUniqueOrThrow({
      select: { slug: true, sellerId: true },
      where: { id }
    })
    if (this.canEdit(user, { sellerId })) {
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

  async create ({ title, description, sellerId, imageUrl }: { title: string, description: string, sellerId: Auction['sellerId'], imageUrl: string }, user?: User): Promise<Auction> {
    if (user == null || user.id !== sellerId) {
      throw new UnauthorizedError()
    } else if (user.role === UserRole.PENDING_REVIEW) {
      throw new ForbiddenError('Your account hasn’t been approved yet.')
    }
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    return await prisma.auction.create({
      data: {
        title,
        description,
        slug,
        imageUrl,
        seller: { connect: { id: sellerId } }
      }
    })
  }

  private canView (user: User | undefined, auction: Auction): boolean {
    const isPublic = auction.status === AuctionStatus.LIVE || auction.status === AuctionStatus.SOLD
    const isAuthorized = user?.role === UserRole.SUPER_USER || user?.id === auction?.sellerId
    return isPublic || isAuthorized
  }

  private canEdit (user: { id: User['id'], role: UserRole } | undefined, auction: { sellerId: Auction['sellerId'] }): boolean {
    if (user == null || user.role === UserRole.PENDING_REVIEW) {
      return false
    } else if (user.role === UserRole.SUPER_USER) {
      return true
    } else {
      return user.id === auction.sellerId
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
