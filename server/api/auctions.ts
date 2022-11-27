import { Auction, AuctionStatus, Prisma, UserRole } from '@prisma/client'
import { User } from '../../shared/types'
import prisma from '../prisma'
import router from './router'

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

export default router([
  {
    method: 'get',
    path: '/',
    async handler (req, res) {
      const where: Prisma.AuctionWhereInput = {
        status: req.query.status as AuctionStatus
      }
      if (typeof req.query.sellerId === 'string') {
        where.sellerId = parseInt(req.query.sellerId)
      }
      const auctions = await prisma.auction.findMany({ where, orderBy: { createdAt: 'desc' } })
      return res.success(auctions)
    }
  },
  {
    method: 'post',
    path: '/',
    async handler (req, res) {
      if (req.session.user == null) {
        return res.unauthorized()
      }
      const data: Prisma.AuctionCreateInput = {
        title: req.body.title,
        description: req.body.description,
        slug: req.body.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        seller: {
          connect: { id: req.session.user.id }
        },
        // TODO: remove when admin approval is added
        status: AuctionStatus.LIVE,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
      }
      const auction = await prisma.auction.create({ data })
      return res.created(auction)
    }
  },
  {
    method: 'get',
    path: '/:id',
    async handler (req, res) {
      const auction = await prisma.auction.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { seller: true }
      })
      if (auction == null) {
        return res.notFound()
      } else if (canView(req.session.user, auction)) {
        return res.success(auction)
      } else {
        return res.unauthorized()
      }
    }
  },
  {
    method: 'patch',
    path: '/:id',
    async handler (req, res) {
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
    }
  },
  {
    method: 'delete',
    path: '/:id',
    async handler (req, res) {
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
    }
  }
])
