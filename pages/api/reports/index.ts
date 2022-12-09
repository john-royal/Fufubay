import prisma from 'api-lib/common/prisma'
import { Route, Router } from 'api-lib/router'
import Joi from 'joi'

interface CreateReportInput { message: string, auctionId: number, userId: number }

export default Router.for(
  new Route<{}, CreateReportInput>({
    method: 'POST',
    schema: {
      body: Joi.object({
        message: Joi.string().required(),
        auctionId: Joi.number().integer().required(),
        userId: Joi.number().integer().required()
      })
    },
    async handler (req, res) {
      if (!req.isAuthenticated({ userId: req.body.userId })) {
        return res.forbidden()
      }
      const report = await prisma.report.create({
        data: req.body
      })
      res.created(report)
    }
  })
)
