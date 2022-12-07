import { Auction, AuctionStatus, User, UserRole } from '@prisma/client'
import { patchAuction } from 'api-lib/auctions'
import { Route, Router } from 'api-lib/router'
import Joi from 'joi'

export default Router.for(
  new Route<{ id: User['id'] }, Partial<Auction>>({
    method: 'PUT',
    schema: {
      query: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        status: Joi.string().allow(...Object.values(AuctionStatus)).required(),
        startsAt: Joi.date(),
        endsAt: Joi.date()
      })
    },
    async handler (req, res) {
      if (req.session.user == null) {
        return res.unauthorized()
      } else if (req.session.user.role !== UserRole.SUPER_USER) {
        return res.forbidden()
      }

      const user = await patchAuction(req.query.id, req.body)
      res.success(user)
    }
  })
)
