import prisma from 'api-lib/common/prisma'
import { Route, Router } from 'api-lib/router'
import Joi from 'joi'

interface CreateReportInput { customerName?: string, message: string, auctionId: number, customerId?: number, sellerId: number }

export default Router.for(
  new Route<{}, CreateReportInput>({
    method: 'POST',
    schema: {
      body: Joi.object({
        customerName: Joi.string(),
        message: Joi.string().required(),
        auctionId: Joi.number().integer().required(),
        customerId: Joi.number().integer(),
        sellerId: Joi.number().integer().required()
      })
    },
    async handler (req, res) {
      const { customerName, customerId } = req.body
      if (req.session.user?.id != null) {
        if (!req.isAuthenticated({ userId: customerId })) {
          return res.forbidden('You do not have permission to submit a report on behalf of that user.')
        }
      } else if (customerName == null) {
        return res.badRequest('Please sign in or enter a customer name.')
      }
      const report = await prisma.report.create({
        data: req.body
      })
      res.created(report)
    }
  })
)
