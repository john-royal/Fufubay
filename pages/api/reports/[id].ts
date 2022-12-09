import { UserRole } from '@prisma/client'
import prisma from 'api-lib/common/prisma'
import { Route, Router } from 'api-lib/router'
import Joi from 'joi'

interface PatchReportInput { isResolved: boolean }

export default Router.for(
  new Route<{ id: number }, PatchReportInput>({
    method: 'PATCH',
    schema: {
      query: Joi.object({
        id: Joi.number().integer().required()
      }),
      body: Joi.object({
        isResolved: Joi.boolean()
      })
    },
    async handler (req, res) {
      if (!req.isAuthenticated({ role: UserRole.SUPER_USER })) {
        return res.forbidden()
      }
      const report = await prisma.report.update({
        data: req.body,
        where: { id: req.query.id }
      })
      res.success(report)
    }
  })
)
