import { Request, Response, NextFunction, RequestHandler } from 'express'
import { User } from '@prisma/client'
import { sign, verify } from 'jsonwebtoken'

export default function jwt ({ secret }: { secret: string }): RequestHandler {
  return function token (req: Request, res: Response, next: NextFunction): void {
    Object.assign(req, {
      signIn (user: User) {
        res.cookie('token', sign(user, secret))
      },
      signOut () {
        res.clearCookie('token')
      }
    })
    try {
      req.user = verify(req.cookies.token, secret) as User
    } catch (error) {
      req.user = null
    }
    next()
  }
}
