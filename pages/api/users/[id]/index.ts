import { User } from '@prisma/client'
import { Route, Router } from 'api-lib/router'
import { getUser, patchUser, PatchUserInput } from 'api-lib/users'
import Joi from 'joi'

export default Router.for([
  new Route<{ id: User['id'] | 'me' }>({
    method: 'GET',
    schema: {
      query: Joi.object({
        id: Joi.number().integer().allow('me').required()
      })
    },
    async handler (req, res) {
      const id = req.query.id === 'me' ? req.session.user?.id : req.query.id
      if (id == null) {
        return req.query.id === 'me' ? res.success(null) : res.badRequest('Cannot find user with null ID')
      }
      const user = await getUser(id)
      req.session.user = user
      await req.session.save()
      return res.success(user)
    }
  }),
  new Route<{ id: User['id'] }, PatchUserInput>({
    method: 'PATCH',
    schema: {
      query: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        username: Joi.string(),
        email: Joi.string().email(),
        phone: Joi.string().replace(/\D/g, '').length(10).pattern(/^\d+$/),
        password: Joi.string(),
        bio: Joi.string().allow(''),
        imageUrl: Joi.string().uri()
      })
    },
    async handler (req, res) {
      if (req.session.user == null) {
        return res.unauthorized()
      } else if (req.session.user.id !== req.query.id) {
        return res.forbidden()
      }

      const user = await patchUser(req.query.id, req.body)
      req.session.user = user
      await req.session.save()
      res.success(user)
    }
  })
])
