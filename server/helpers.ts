import { User } from '../shared/types'
import { Request, Response, NextFunction } from 'express'

export default function helpers (req: Request, res: Response, next: NextFunction): void {
  Object.assign(req, {
    async signIn (user: User) {
      req.session.user = user
      await req.session.save()
    },
    async signOut () {
      req.session.destroy()
    }
  })
  Object.assign(res, {
    success<T>(data: T) {
      return res.status(200).json({
        success: true,
        data
      })
    },
    created<T>(data: T) {
      return res.status(201).json({
        success: true,
        data
      })
    },
    badRequest (message?: string) {
      return res.status(400).json({
        success: false,
        error: { error: 'Bad Request', message }
      })
    },
    unauthorized (message?: string) {
      return res.status(401).json({
        success: false,
        error: { error: 'Unauthorized', message }
      })
    },
    notFound (message?: string) {
      return res.status(404).json({
        success: false,
        error: { error: 'Not Found', message }
      })
    },
    internalServerError (error: Error) {
      return res.status(500).json({
        success: false,
        error: Object.assign({ message: error.toString() }, error)
      })
    }
  })
  next()
}
