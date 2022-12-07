import { User, UserRole } from '@prisma/client'
import { Route, Router } from 'api-lib/router'
import { patchUser, PatchUserInput } from 'api-lib/users'
import Joi from 'joi'

export default Router.for(
  new Route<{ id: User['id'] }, PatchUserInput>({
    method: 'PUT',
    schema: {
      query: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        role: Joi.string().allow(...Object.values(UserRole))
      })
    },
    async handler (req, res) {
      if (req.session.user == null) {
        return res.unauthorized()
      } else if (req.session.user.role !== UserRole.SUPER_USER) {
        return res.forbidden()
      }

      const user = await patchUser(req.query.id, req.body)
      res.success(user)
    }
  })
)
