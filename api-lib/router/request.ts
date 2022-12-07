import { User, UserRole } from '@prisma/client'
import { IronSession } from 'iron-session'
import Joi from 'joi'
import { NextApiRequest } from 'next'

export interface Schema<Query, Body> {
  query?: Joi.ObjectSchema<Query>
  body?: Joi.ObjectSchema<Body>
}

export default class Request<Query = {}, Body = {}> {
  query: Query
  body: Body

  constructor (public readonly raw: NextApiRequest, private readonly schema?: Schema<Query, Body>) {
    this.query = Object.assign({}, raw.query) as Query
    this.body = Object.assign({}, raw.body) as Body
  }

  async validate (): Promise<void> {
    if (this.schema == null) return
    if (this.schema.query != null) {
      this.query = await this.schema.query.validateAsync(this.query)
    }
    if (this.schema.body != null) {
      this.body = await this.schema.body.validateAsync(this.body)
    }
  }

  isAuthenticated ({ userId, role }: { userId?: User['id'], role?: UserRole }): boolean {
    if (this.session.user == null) return false
    return (userId != null && this.session.user.id === userId) || (role != null && this.session.user.role === role)
  }

  get session (): IronSession {
    return this.raw.session
  }
}
