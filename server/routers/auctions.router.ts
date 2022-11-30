import { Auction, AuctionStatus } from '@prisma/client'
import { Request, Router } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import { body, param, query, validationResult } from 'express-validator'
import AuctionsController from '../controllers/auctions.controller'

const controller = new AuctionsController()
const router = Router()

router.get(
  '/',
  query('search').optional(),
  query('status').isIn(Object.values(AuctionStatus)).optional(),
  query('sellerId').isNumeric().toInt().optional(),
  (req: Request<{}, {}, {}, { search: string, status: AuctionStatus, sellerId: Auction['sellerId'] }>, res, next) => {
    validationResult(req).throw()

    controller.findMany({
      where: {
        search: req.query.search,
        status: req.query.status,
        sellerId: req.query.sellerId
      }
    })
      .then(res.success)
      .catch(next)
  }
)

router.post(
  '/',
  body('title'),
  body('description'),
  body('imageUrl').isURL(),
  body('sellerId').isNumeric().toInt(),
  (req: Request<{}, { title: string, description: string, imageUrl: string, sellerId: number }>, res, next) => {
    validationResult(req).throw()

    controller.create({
      title: req.body.title,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      sellerId: req.body.sellerId
    }, req.session.user)
      .then(res.created)
      .catch(next)
  }
)

router.get(
  '/:id',
  param('id').isNumeric().toInt(),
  (req: Request<{ id: number }>, res, next) => {
    validationResult(req).throw()

    controller.findOne(req.params.id, req.session.user)
      .then(res.success)
      .catch(next)
  }
)

router.patch(
  '/:id',
  param('id').isNumeric().toInt(),
  (req: Request<{ id: number }, {}, Partial<Auction>>, res, next) => {
    validationResult(req).throw()

    controller.updateOne(req.params.id, req.body, req.session.user)
      .then(res.success)
      .catch(next)
  }
)

router.delete(
  '/:id',
  param('id').isNumeric().toInt(),
  (req: Request<{ id: number }>, res, next) => {
    validationResult(req).throw()

    controller.deleteOne(req.params.id, req.session.user)
      .then(() => res.success(null))
      .catch(next)
  }
)

router.use('/:id/image', fileUpload()) // separate from route handler to suppress a false TypeScript error

router.put(
  '/:id/image',
  param('id').isNumeric().toInt(),
  (req: Request<{ id: number }>, res, next) => {
    validationResult(req).throw()

    controller.putImage(req.params.id, req.files?.image as UploadedFile, req.session.user)
      .then(res.success)
      .catch(next)
  }
)

export default router
