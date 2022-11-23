import { Prisma } from '@prisma/client'
import prisma from '../prisma'
import router from './router'

export default router([
  {
    method: 'get',
    path: '/',
    async handler (req, res) {
      const where: Prisma.BidWhereInput = {}
      if (typeof req.query.auctionID === 'string') {
        where.auctionID = parseInt(req.query.auctionID)
      }
      if (typeof req.query.userID === 'string') {
        where.userID = parseInt(req.query.userID)
      }

      const include: Prisma.BidInclude = {}
      if (typeof req.query.include === 'string') {
        const properties = req.query.include.split(',') as Array<keyof Prisma.BidInclude>
        for (const property of properties) {
          include[property] = true
        }
      }

      const bids = await prisma.bid.findMany({
        where,
        include,
        orderBy: { date: 'desc' }
      })
      return res.success(bids)
    }
  },
  {
    method: 'post',
    path: '/',
    async handler (req, res) {
      if (req.session.user == null) {
        return res.unauthorized()
      }
      const data: Prisma.BidCreateInput = {
        amount: req.body.amount,
        auction: {
          connect: {
            id: req.body.auctionID
          }
        },
        user: {
          connect: {
            id: req.session.user.id
          }
        }
      }
      const bid = await prisma.bid.create({ data })
      return res.success(bid)
    }
  }
])
