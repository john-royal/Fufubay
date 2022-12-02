import { celebrate, Joi, Segments } from 'celebrate'
import { Router } from 'express'
import AuthController from './auth.controller'

const router = Router()
const controller = new AuthController()

router.post(
  '/sign-in',
  celebrate<{}, {}, { email: string, password: string }>({
    [Segments.BODY]: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  }),
  function (req, res, next) {
    controller.signIn({ email: req.body.email, password: req.body.password })
      .then(async user => {
        await req.signIn(user)
        res.success(user)
      })
      .catch(next)
  }
)

router.get('/sign-out', function (req, res, next) {
  req.signOut()
    .then(() => res.success(null))
    .catch(next)
})

export default router
