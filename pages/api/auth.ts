import { signIn, SignInInput } from 'api-lib/auth'
import { Route, Router } from 'api-lib/router'
import Joi from 'joi'

export default Router.for([
  new Route<{}, SignInInput>(
    {
      method: 'POST',
      schema: {
        body: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required()
        })
      },
      async handler (req, res) {
        const user = await signIn(req.body)
        req.session.user = user
        await req.session.save()
        res.success(user)
      }
    }
  ),
  new Route({
    method: 'DELETE',
    async handler (req, res) {
      req.session.destroy()
      res.success(null)
    }
  })
])
