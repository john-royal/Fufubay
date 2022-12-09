import prisma from 'api-lib/common/prisma'
import { Route, Router } from 'api-lib/router'
import Joi from 'joi'

interface CreateReviewInput { rating: number, comments: string, sellerId: number, customerId: number }

export default Router.for(
  new Route<{}, CreateReviewInput>({
    method: 'POST',
    schema: {
      body: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        message: Joi.string().required(),
        sellerId: Joi.number().integer().required(),
        customerId: Joi.number().integer().required()
      })
    },
    async handler (req, res) {
      if (!req.isAuthenticated({ userId: req.body.customerId })) {
        return res.forbidden()
      }
      const review = await prisma.review.create({
        data: req.body
      })
      res.created(review)
    }
  })
)
