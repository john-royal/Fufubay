import express, { NextFunction, Request, Response } from 'express'
import { ironSession } from 'iron-session/express'
import auctions from './auctions'
import auth from './auth'
import bids from './bids'
import helpers from '../helpers'
import users from './users'
import { sessionOptions } from '../../shared/session'
import morgan from 'morgan'
import { Prisma } from '@prisma/client'

const api = express.Router()
const session = ironSession(sessionOptions)

api.use(morgan('common'))
api.use(express.json())
api.use(session) // eslint-disable-line @typescript-eslint/no-misused-promises
api.use(helpers)
api.use('/auctions', auctions)
api.use('/auth', auth)
api.use('/bids', bids)
api.use('/users', users)

api.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  if (err instanceof Prisma.NotFoundError) {
    return res.notFound(err.message)
  }
  res.internalServerError(err)
})

export default api
