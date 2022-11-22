import { Auction, Prisma } from '@prisma/client'
import prisma from '../prisma'
import router from './router'

export default router([
  {
    method: 'get',
    path: '/',
    async handler (req, res) {
      const where: Prisma.AuctionWhereInput = {}
      if (typeof req.query.sellerID === 'string') {
        where.sellerID = parseInt(req.query.sellerID)
      }
      const auctions = await prisma.auction.findMany({ where, orderBy: { createdAt: 'desc' } })
      return res.success(auctions)
    }
  },
  {
    method: 'post',
    path: '/',
    async handler (req, res) {
      let auction = req.body as Auction
      if (req.user == null) {
        return res.unauthorized()
      }
      auction = await prisma.auction.create({
        data: {
          title: auction.title,
          description: auction.description,
          slug: auction.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          seller: {
            connect: {
              id: req.user.id
            }
          }
        }
      })
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
      if (auction != null) {
        return res.success(auction)
      } else {
        return res.notFound()
      }
    }
  },
  {
    method: 'patch',
    path: '/:id',
    async handler (req, res) {
      const auction = await prisma.auction.findUniqueOrThrow({
        where: { id: parseInt(req.params.id) },
        include: { seller: true }
      })
      if (req.user == null || auction.sellerID !== req.user.id) {
        return res.unauthorized()
      }
      await prisma.auction.update({
        where: { id: auction.id },
        data: Object.assign(auction, req.body)
      })
      return res.success(null)
    }
  },
  {
    method: 'delete',
    path: '/:id',
    async handler (req, res) {
      const auction = await prisma.auction.findUniqueOrThrow({
        where: { id: parseInt(req.params.id) }
      })
      if (req.user == null || auction.sellerID !== req.user.id) {
        return res.unauthorized()
      }
      await prisma.auction.delete({ where: { id: auction.id } })
      return res.success(null)
    }
  }
])
