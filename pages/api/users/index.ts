import { Route, Router } from 'api-lib/router'
import { postUser, PostUserInput } from 'api-lib/users'
import Joi from 'joi'

export default Router.for(
  new Route<{}, PostUserInput>({
    method: 'POST',
    schema: {
      body: Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
      })
    },
    async handler (req, res) {
      const user = await postUser(req.body)
      req.session.user = user
      await req.session.save()
      res.created(user)
    }
  })
)
