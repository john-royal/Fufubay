import { User } from '@prisma/client'
import { Route, Router } from 'api-lib/router'
import { putAddress, PutAddressInput } from 'api-lib/users'
import Joi from 'joi'

export default Router.for(
  new Route<{ id: User['id'] }, PutAddressInput>({
    method: 'PUT',
    schema: {
      query: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        addressLine1: Joi.string(),
        addressLine2: Joi.string().allow(null),
        addressCity: Joi.string(),
        addressState: Joi.string(),
        addressPostalCode: Joi.string(),
        addressCountry: Joi.string()
      })
    },
    async handler (req, res) {
      if (req.session.user == null) {
        return res.unauthorized()
      } else if (req.session.user.id !== req.query.id) {
        return res.forbidden()
      }

      const user = await putAddress(req.query.id, req.body)
      req.session.user = user
      await req.session.save()
      res.success(user)
    }
  })
)
