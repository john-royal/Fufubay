import { Prisma } from '@prisma/client'
import { AppError } from 'api-lib/common/errors'
import Joi from 'joi'
import { NextApiRequest, NextApiResponse } from 'next'
import Request, { Schema } from './request'
import Response from './response'

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type Handler<Query extends {}, Body extends {}> = (req: Request<Query, Body>, res: Response) => Promise<void>

export default class Route<Query extends {} = {}, Body extends {} = {}> {
  private readonly method: Method
  private readonly schema?: Schema<Query, Body>
  private readonly handler: Handler<Query, Body>

  constructor ({ method, schema, handler }: {
    method: Method
    schema?: Schema<Query, Body>
    handler: Handler<Query, Body>
  }) {
    this.method = method
    this.schema = schema
    this.handler = handler
  }

  isMatch (method: string): boolean {
    return this.method === method
  }

  async handle (rawReq: NextApiRequest, rawRes: NextApiResponse): Promise<void> {
    const req = new Request<Query, Body>(rawReq)
    const res = new Response(rawRes)
    try {
      await req.validate()
      await this.handler(req, res)
    } catch (e) {
      const { status, error } = this.normalizeError(e)
      res.raw.status(status).json({
        success: false,
        error
      })
    }
  }

  private normalizeError (error: any): { status: number, error: Error } {
    if (error instanceof AppError) {
      return {
        status: error.status,
        error
      }
    } else if (error instanceof Joi.ValidationError) {
      return {
        status: 400,
        error: Object.assign({}, error, { message: error.details.map(detail => detail.message).join(', ') })
      }
    } else if (error instanceof Prisma.NotFoundError) {
      return {
        status: 404,
        error
      }
    } else {
      return {
        status: 500,
        error: error as Error
      }
    }
  }
}
