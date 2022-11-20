import express from 'express'
import cookieParser from 'cookie-parser'
import auctions from './auctions'
import auth from './auth'
import helpers from '../middleware/helpers'
import jwt from '../middleware/jwt'
import users from './users'

const api = express.Router()

api.use(express.json())
api.use(cookieParser())
api.use(jwt({ secret: process.env.JWT_SECRET ?? '' }))
api.use(helpers)
api.use('/auctions', auctions)
api.use('/auth', auth)
api.use('/users', users)

export default api
