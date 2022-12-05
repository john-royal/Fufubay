import { Auction, AuctionStatus } from '@prisma/client'
import { celebrate, Joi, Segments } from 'celebrate'
import { Router } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import AuctionsController from './auctions.controller'

declare global {
  namespace Express {
    interface Request {
      auctions: AuctionsController
    }
  }
}

const router = Router()

router.use((req, res, next) => {
  req.auctions = new AuctionsController(req.session.user)
  next()
})

router.get(
  '/',
  celebrate<{}, {}, {}, { search: string, status: AuctionStatus[], sellerId: Auction['sellerId'] }>({
    [Segments.QUERY]: Joi.object({
      search: Joi.string(),
      status: Joi.string().custom(value => {
        const result = Joi.array().allow(...Object.values(AuctionStatus)).validate(value.split(','))
        return result.value ?? result.error
      }),
      sellerId: Joi.number().integer()
    })
  }),
  (req, res, next) => {
    req.auctions.findMany({
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
  celebrate<{}, {}, { title: string, description: string, sellerId: number }>({
    [Segments.BODY]: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      sellerId: Joi.number().integer().required()
    })
  }),
  (req, res, next) => {
    req.auctions.create({
      title: req.body.title,
      description: req.body.description,
      sellerId: req.body.sellerId
    })
      .then(res.created)
      .catch(next)
  }
)

router.get(
  '/:id',
  celebrate<{ id: number }, {}, {}, { include: Array<'bids' | 'seller'> }>({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer()
    }),
    [Segments.QUERY]: Joi.object({
      include: Joi.string().custom(value => {
        const result = Joi.array().allow('bids', 'seller').validate(value.split(','))
        return result.value ?? result.error
      })
    })
  }),
  (req, res, next) => {
    req.auctions.findOne(req.params.id, {
      bids: req.query.include?.includes('bids') ?? false,
      seller: req.query.include?.includes('seller') ?? false
    })
      .then(res.success)
      .catch(next)
  }
)

router.patch(
  '/:id',
  celebrate<{ id: number }, {}, Partial<Auction>>({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer()
    }),
    [Segments.BODY]: Joi.object({
      title: Joi.string(),
      description: Joi.string(),
      imageUrl: Joi.string().uri(),
      status: Joi.string().valid(...Object.values(AuctionStatus)),
      startsAt: Joi.date(),
      endsAt: Joi.date()
    })
  }),
  (req, res, next) => {
    req.auctions.updateOne(req.params.id, req.body)
      .then(res.success)
      .catch(next)
  }
)

router.delete(
  '/:id',
  celebrate<{ id: number }>({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer()
    })
  }),
  (req, res, next) => {
    req.auctions.deleteOne(req.params.id)
      .then(() => res.success(null))
      .catch(next)
  }
)

router.post(
  '/:id/finalize',
  celebrate<{ id: number }, {}, { winningBidId: number, reason: string }>({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer()
    }),
    [Segments.BODY]: Joi.object({
      winningBidId: Joi.number().integer().required(),
      reason: Joi.string().required()
    })
  }),
  (req, res, next) => {
    req.auctions.finalize(req.params.id, req.body)
      .then(res.success)
      .catch(next)
  }
)

router.use('/:id/image', fileUpload()) // separate from route handler to suppress a false TypeScript error

router.put(
  '/:id/image',
  celebrate<{ id: number }>({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer()
    })
  }),
  (req, res, next) => {
    req.auctions.putImage(req.params.id, req.files?.image as UploadedFile)
      .then(res.success)
      .catch(next)
  }
)

export default router
