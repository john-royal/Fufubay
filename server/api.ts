import { Prisma } from '@prisma/client'
import { isCelebrateError } from 'celebrate'
import express, { NextFunction, Request, Response } from 'express'
import { ironSession } from 'iron-session/express'
import { sessionOptions } from '../common/session'
import auctions from './auctions/auctions.router'
import auth from './auth/auth.router'
import bids from './bids/bids.router'
import { AppError, helpers } from './common'
import users from './users/users.router'

const api = express.Router()

api.use(express.json())
api.use(ironSession(sessionOptions)) // eslint-disable-line @typescript-eslint/no-misused-promises
api.use(helpers)
api.use('/auctions', auctions)
api.use('/auth', auth)
api.use('/bids', bids)
api.use('/users', users)

api.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error)

  if (error instanceof Prisma.NotFoundError) {
    res.notFound(error.message)
  } else if (error instanceof AppError) {
    res.status(error.status).json({ success: false, error })
  } else if (isCelebrateError(error)) {
    res.status(400).json({ success: false, error })
  } else {
    res.internalServerError(error)
  }
})

export default api
