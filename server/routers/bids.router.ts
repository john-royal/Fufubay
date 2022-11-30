import { Bid } from '@prisma/client'
import { Request, Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import BidsController from '../controllers/bids.controller'

const router = Router()
const controller = new BidsController()

router.get(
  '/',
  query('auctionId').isNumeric().toInt().optional().default(undefined),
  query('userId').isNumeric().toInt().optional().default(undefined),
  query('include').isString().matches(/(auction|user)(,(auction|user))?/).optional().default(''),
  function (req: Request<{}, {}, {}, { auctionId?: number, userId?: number, include?: string }>, res, next) {
    validationResult(req).throw()

    controller.findMany({
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
  body('amount').isNumeric().toInt(),
  body('auctionId').isNumeric().toInt(),
  body('userId').isNumeric().toInt(),
  function (req: Request<{}, { amount: number, auctionId: Bid['auctionId'], userId: Bid['userId'] }>, res, next) {
    validationResult(req).throw()

    controller.create({
      amount: req.body.amount,
      auctionId: req.body.auctionId,
      userId: req.body.userId
    }, req.session.user)
      .then(res.success)
      .catch(next)
  }
)

export default router
