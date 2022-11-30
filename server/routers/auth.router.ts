import { Request, Router } from 'express'
import { body, validationResult } from 'express-validator'
import AuthController from '../controllers/auth.controller'

const controller = new AuthController()
const router = Router()

router.post(
  '/sign-in',
  body('email').isEmail(),
  body('password'),
  function (req: Request<{}, { email: string, password: string }>, res, next) {
    validationResult(req).throw()

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
