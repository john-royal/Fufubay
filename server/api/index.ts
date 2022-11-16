import express from 'express'
import session from 'express-session'
import auth from './auth'

const api = express.Router()

api.use(express.json())
api.use(session({
  secret: process.env.SESSION_SECRET ?? '',
  saveUninitialized: false,
  resave: true
}))
api.use('/auth', auth)

export default api
