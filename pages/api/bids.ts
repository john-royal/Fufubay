import { createBid, CreateBidInput } from 'api-lib/bids'
import { Route, Router } from 'api-lib/router'
import Joi from 'joi'

export default Router.for(
  new Route<{}, CreateBidInput>({
    method: 'POST',
    schema: {
      body: Joi.object({
        amount: Joi.number().required(),
        auctionId: Joi.number().integer().required(),
        userId: Joi.number().integer().required()
      })
    },
    async handler (req, res) {
      if (req.session.user == null) {
        return res.unauthorized()
      } else if (req.session.user.id !== req.body.userId) {
        return res.forbidden()
      }
      const bid = await createBid(req.body)
      res.created(bid)
    }
  })
)
