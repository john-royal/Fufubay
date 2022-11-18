import { Request, Response, NextFunction } from 'express'
import { User } from '@prisma/client'

export default function helpers (req: Request, res: Response, next: NextFunction): void {
  Object.assign(req, {
    async signIn (user: User) {
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate(err => {
          if (err != null) {
            return reject(err)
          }
          req.session.user = user
          req.session.save()
          resolve()
        })
      })
    },
    async signOut () {
      await new Promise<void>((resolve, reject) => {
        req.session.user = null
        req.session.save(err => {
          if (err != null) { return reject(err) }
          req.session.regenerate(err => {
            if (err != null) { return reject(err) }
            resolve()
          })
        })
      })
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
    badRequest () {
      return res.status(400).json({
        success: false,
        error: { error: 'Bad Request' }
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
