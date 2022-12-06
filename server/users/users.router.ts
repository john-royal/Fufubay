import { User, UserRole } from '@prisma/client'
import { celebrate, Segments, Joi } from 'celebrate'
import { Request, Router } from 'express'
import fileUpload, { UploadedFile } from 'express-fileupload'
import UsersController from './users.controller'

declare global {
  namespace Express {
    interface Request {
      users: UsersController
    }
  }
}

const router = Router()

router.use(function (req: Request, res, next) {
  req.users = new UsersController(req.session.user)
  next()
})

router.get(
  '/',
  (req, res, next) => {
    req.users.findMany()
      .then(res.success)
      .catch(next)
  }
)

router.post(
  '/',
  celebrate<{}, {}, { username: string, email: string, password: string }>({
    [Segments.BODY]: Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  }),
  (req, res, next) => {
    req.users.create(req.body)
      .then(async user => {
        await req.signIn(user)
        res.created(user)
      })
      .catch(next)
  }
)

router.get(
  '/me',
  (req, res, next) => {
    const id = req.session.user?.id

    if (id != null) {
      return res.redirect(`/api/users/${id}`)
    } else {
      return res.badRequest('Cannot access /api/users/me without a signed-in user')
    }
  }
)

router.get(
  '/:id',
  celebrate<{ id: number }>({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer()
    })
  }),
  (req, res, next) => {
    req.users.findOne(req.params.id)
      .then(res.success)
      .catch(next)
  }
)

router.patch(
  '/:id',
  celebrate<{ id: number }, {}, Partial<User>>({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer()
    }),
    [Segments.BODY]: Joi.object({
      username: Joi.string(),
      email: Joi.string().email(),
      phone: Joi.string().replace(/\D/g, '').length(10).pattern(/^\d+$/),
      password: Joi.string(),
      bio: Joi.string().allow(''),
      imageUrl: Joi.string().uri(),
      addressLine1: Joi.string(),
      addressLine2: Joi.string().allow(null),
      addressCity: Joi.string(),
      addressState: Joi.string(),
      addressPostalCode: Joi.string(),
      addressCountry: Joi.string(),
      paymentCardId: Joi.string(),
      role: Joi.string().valid(...Object.values(UserRole))
    })
  }),
  (req: Request<{ id: number }, {}, Partial<User>>, res, next) => {
    req.users.updateOne(req.params.id, {
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      bio: req.body.bio,
      imageUrl: req.body.imageUrl,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      addressCity: req.body.addressCity,
      addressState: req.body.addressState,
      addressPostalCode: req.body.addressPostalCode,
      addressCountry: req.body.addressCountry,
      paymentCardId: req.body.paymentCardId,
      role: req.body.role
    })
      .then(async user => {
        await req.signIn(user)
        res.success(user)
      })
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
    req.users.deleteOne(req.params.id)
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
    req.users.putImage(req.params.id, req.files?.image as UploadedFile)
      .then(res.success)
      .catch(next)
  }
)

router.get(
  '/:id/seller',
  celebrate<{ id: number }>({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer()
    })
  }),
  (req, res, next) => {
    req.users.getSellerAccount(req.params.id)
      .then(res.success)
      .catch(next)
  }
)

router.get(
  '/:id/seller-login',
  celebrate<{ id: number }>({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer()
    })
  }),
  (req, res, next) => {
    const url = (pathname: string): string => {
      return new URL(pathname, `${req.protocol}://${req.get('host') as string}`).toString()
    }
    req.users.getSellerLoginLink(req.params.id, {
      returnUrl: url('/account/settings'),
      refreshUrl: url(req.originalUrl)
    })
      .then(loginLink => {
        res.redirect(loginLink.url)
      })
      .catch(next)
  }
)

router.get(
  '/:id/setup-intent',
  celebrate<{ id: number }>({
    [Segments.PARAMS]: Joi.object({
      id: Joi.number().integer()
    })
  }),
  (req, res, next) => {
    req.users.getSetupIntent(req.params.id)
      .then(res.success)
      .catch(next)
  }
)

export default router
