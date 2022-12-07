import { Auction } from '@prisma/client'
import { finalizeAuction, FinalizeAuctionInput, isAuthorized } from 'api-lib/auctions'
import { Route, Router } from 'api-lib/router'
import Joi from 'joi'

export default Router.for(
  new Route<{ id: Auction['id'] }, FinalizeAuctionInput>({
    method: 'PUT',
    schema: {
      query: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        winningBidId: Joi.string().required()
      })
    },
    async handler (req, res) {
      if (req.session.user == null) {
        return res.unauthorized()
      }

      if (await isAuthorized(req.session.user.id, req.query.id)) {
        const auction = await finalizeAuction(req.query.id, req.body)
        res.success(auction)
      } else {
        res.forbidden()
      }
    }
  })
)
