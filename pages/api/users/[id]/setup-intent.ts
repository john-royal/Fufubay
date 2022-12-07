import { User } from '@prisma/client'
import { Route, Router } from 'api-lib/router'
import { getSetupIntent } from 'api-lib/users'
import Joi from 'joi'

export default Router.for(
  new Route<{ id: User['id'] }>({
    method: 'GET',
    schema: {
      query: Joi.object({
        id: Joi.number().integer().required()
      })
    },
    async handler (req, res) {
      if (req.session.user == null) {
        return res.unauthorized()
      } else if (req.session.user.id !== req.query.id) {
        return res.forbidden()
      }

      const setupIntent = await getSetupIntent(req.query.id)
      res.success(setupIntent)
    }
  })
)
