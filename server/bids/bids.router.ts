import { celebrate, Joi, Segments } from 'celebrate'
import { Router } from 'express'
import BidsController from './bids.controller'

declare global {
  namespace Express {
    interface Request {
      bids: BidsController
    }
  }
}

const router = Router()

router.use((req, res, next) => {
  req.bids = new BidsController(req.session.user)
  next()
})

router.get(
  '/',
  celebrate<{}, {}, {}, { auctionId?: number, userId?: number, include?: string }>({
    [Segments.QUERY]: Joi.object({
      auctionId: Joi.number().integer(),
      userId: Joi.number().integer(),
      include: Joi.string().pattern(/^((auction|user),?)*$/)
    })
  }),
  (req, res, next) => {
    req.bids.findMany({
      where: {
        auctionId: req.query.auctionId,
        userId: req.query.userId
      },
      include: {
        auction: req.query.include?.includes('auction') ?? false,
        user: req.query.include?.includes('user') ?? false
      }
    })
      .then(res.success)
      .catch(next)
  }
)

router.post('/',
  celebrate<{}, {}, { amount: number, auctionId: number, userId: number }>({
    [Segments.BODY]: Joi.object({
      amount: Joi.number().required(),
      auctionId: Joi.number().integer().required(),
      userId: Joi.number().integer().required()
    })
  }),
  (req, res, next) => {
    req.bids.create({
      amount: req.body.amount,
      auctionId: req.body.auctionId,
      userId: req.body.userId
    })
      .then(res.success)
      .catch(next)
  }
)

export default router
