import { User } from '@prisma/client'
import { isAuthorized, putImage } from 'api-lib/auctions'
import { Route, Router } from 'api-lib/router'
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
      } else if (!(await isAuthorized(req.session.user.id, req.query.id))) {
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

      const auction = await putImage(req.query.id, image)
      res.success(auction)
    }
  })
)
