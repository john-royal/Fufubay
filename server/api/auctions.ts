import { Auction, AuctionStatus, Prisma, UserRole } from '@prisma/client'
import { Router } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import { extname } from 'path'
import { User } from '../../shared/types'
import s3 from '../s3'
import prisma from '../prisma'
import { withHandler } from './router'

const canView = (user: User | undefined, auction: Auction): boolean => {
  const isPublic = auction.status === AuctionStatus.LIVE || auction.status === AuctionStatus.SOLD
  const isAuthorized = user?.role === UserRole.SUPER_USER || user?.id === auction?.sellerId
  return isPublic || isAuthorized
}

const canEdit = (user: { id: User['id'], role: UserRole } | undefined, auction: { sellerId: Auction['sellerId'] }): boolean => {
  if (user == null || user.role === UserRole.PENDING_REVIEW) {
    return false
  } else if (user.role === UserRole.SUPER_USER) {
    return true
  } else {
    return user.id === auction.sellerId
  }
}

const normalizeSearchQuery = (input: string): string => {
  const decoded = decodeURIComponent(input)
  const parts = decoded.split(/\s+/)
  if (parts.length > 1) {
    return parts
      .map(term => `'${term}'`)
      .join('&')
  } else {
    return decoded
  }
}

const router = Router()

router.get('/', withHandler(async (req, res) => {
  const where: Prisma.AuctionWhereInput = {}
  if (typeof req.query.status === 'string') {
    where.status = req.query.status as AuctionStatus
  } else {
    where.status = AuctionStatus.LIVE
  }
  if (typeof req.query.sellerId === 'string') {
    where.sellerId = parseInt(req.query.sellerId)
  }
  if (typeof req.query.search === 'string') {
    const search = normalizeSearchQuery(req.query.search)
    where.OR = {
      title: { search },
      description: { search }
    }
  }
  const auctions = await prisma.auction.findMany({ where, orderBy: { createdAt: 'desc' } })
  return res.success(auctions)
}))

router.post('/', withHandler(async (req, res) => {
  if (req.session.user == null) {
    return res.unauthorized()
  }
  const data: Prisma.AuctionCreateInput = {
    title: req.body.title,
    description: req.body.description,
    slug: req.body.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
    imageUrl: req.body.imageUrl,
    seller: {
      connect: { id: req.session.user.id }
    }
  }
  const auction = await prisma.auction.create({ data })
  return res.created(auction)
}))

router.get('/:id', withHandler(async (req, res) => {
  const auction = await prisma.auction.findUniqueOrThrow({
    where: { id: parseInt(req.params.id) },
    include: { seller: true }
  })
  if (canView(req.session.user, auction)) {
    return res.success(auction)
  } else {
    return res.unauthorized()
  }
}))

router.patch('/:id', withHandler(async (req, res) => {
  const { id, sellerId } = await prisma.auction.findUniqueOrThrow({
    select: { id: true, sellerId: true },
    where: { id: parseInt(req.params.id) }
  })
  if (canEdit(req.session.user, { sellerId })) {
    const auction = await prisma.auction.update({
      where: { id },
      data: req.body
    })
    return res.success(auction)
  } else {
    return res.unauthorized()
  }
}))

router.put('/:id/image', fileUpload(), withHandler(async (req, res) => {
  const { id, slug, sellerId } = await prisma.auction.findUniqueOrThrow({
    select: { id: true, slug: true, sellerId: true },
    where: { id: parseInt(req.params.id) }
  })
  if (!canEdit(req.session.user, { sellerId })) {
    return res.unauthorized()
  }
  const image = req.files?.image as UploadedFile
  const params: AWS.S3.PutObjectRequest = {
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: `auctions/${id}/${slug}${extname(image.name)}`,
    Body: image.data,
    ACL: 'public-read'
  }
  const result = await s3.upload(params).promise()
  const auction = await prisma.auction.update({ where: { id }, data: { imageUrl: result.Location } })
  return res.success(auction)
}))

router.delete('/:id', withHandler(async (req, res) => {
  const { id, sellerId } = await prisma.auction.findUniqueOrThrow({
    select: { id: true, sellerId: true },
    where: { id: parseInt(req.params.id) }
  })
  if (canEdit(req.session.user, { sellerId })) {
    await prisma.auction.delete({ where: { id } })
    return res.success(null)
  } else {
    return res.unauthorized()
  }
}))

export default router
