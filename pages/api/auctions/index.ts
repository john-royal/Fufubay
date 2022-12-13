import { UserRole } from '@prisma/client'
import { createAuction, CreateAuctionInput } from 'api-lib/auctions'
import { Route, Router } from 'api-lib/router'
import Joi from 'joi'

export default Router.for(
  new Route<{}, CreateAuctionInput>({
    method: 'POST',
    schema: {
      body: Joi.object({
        title: Joi.string().required(),
        subtitle: Joi.string().required(),
        description: Joi.string().required(),
        sellerId: Joi.number().integer().required()
      })
    },
    async handler (req, res) {
      const user = req.session.user
      if (user == null) {
        res.unauthorized()
      } else if (user.id !== req.body.sellerId) {
        res.forbidden(`Cannot create auction on behalf of seller ${req.body.sellerId}`)
      } else if (user.role === UserRole.PENDING_REVIEW) {
        res.forbidden('Your account has not been approved yet.')
      } else {
        const auction = await createAuction(req.body)
        res.created(auction)
      }
    }
  })
)
