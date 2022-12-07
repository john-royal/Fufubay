import { User } from '@prisma/client'
import { Route, Router } from 'api-lib/router'
import { putPaymentCard, PutPaymentCardInput } from 'api-lib/users'
import Joi from 'joi'

export default Router.for(
  new Route<{ id: User['id'] }, PutPaymentCardInput>({
    method: 'PUT',
    schema: {
      query: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        paymentCardId: Joi.string().required()
      })
    },
    async handler (req, res) {
      if (req.session.user == null) {
        return res.unauthorized()
      } else if (req.session.user.id !== req.query.id) {
        return res.forbidden()
      }

      const user = await putPaymentCard(req.query.id, req.body)
      req.session.user = user
      await req.session.save()
      res.success(user)
    }
  })
)
