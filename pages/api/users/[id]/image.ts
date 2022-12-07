import { User } from '@prisma/client'
import { Route, Router } from 'api-lib/router'
import { putImage } from 'api-lib/users'
import formidable, { File } from 'formidable'
import Joi from 'joi'

export const config = {
  api: {
    bodyParser: false
  }
}

export default Router.for(
  new Route<{ id: User['id'] }>({
    method: 'PUT',
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
      const image = await new Promise<File>((resolve, reject) => {
        formidable().parse(req.raw, (err, fields, files) => {
          if (err != null) {
            reject(err)
          } else {
            resolve(files.image as File)
          }
        })
      })

      const user = await putImage(req.query.id, image)
      req.session.user = user
      await req.session.save()
      res.success(user)
    }
  })
)
