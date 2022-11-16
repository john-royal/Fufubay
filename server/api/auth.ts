import prisma from '../prisma'
import router from './router'
import * as scrypt from '../util/scrypt'
import { User } from '@prisma/client'
import { Request } from 'express'

declare module 'express-session' {
  interface SessionData {
    user: User | null
  }
}

export default router([
  {
    method: 'post',
    path: '/create-account',
    async handler (req, res) {
      const { email, password } = req.body as { email: string, password: string }
      const user = await prisma.user.create({
        data: {
          email,
          password: await scrypt.hash(password)
        }
      })
      await signIn(req, user)
      res.status(201).json({
        success: true,
        data: user
      })
    }
  },
  {
    method: 'post',
    path: '/sign-in',
    async handler (req, res) {
      const { email, password } = req.body as { email: string, password: string }

      const user = await prisma.user.findUnique({
        where: { email }
      })
      const isAuthenticated = user != null && await scrypt.compare(password, user.password)

      if (isAuthenticated) {
        await signIn(req, user)
        res.status(200).json({
          success: true,
          data: user
        })
      } else if (user != null) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Wrong password'
          }
        })
      } else {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found'
          }
        })
      }
    }
  },
  {
    method: 'get',
    path: '/sign-out',
    async handler (req, res) {
      await signOut(req)

      res.status(200).json({
        success: true,
        data: {}
      })
    }
  },
  {
    method: 'get',
    path: '/user',
    async handler (req, res) {
      if (req.session.user != null) {
        res.status(200).json({
          success: true,
          data: req.session.user
        })
      } else {
        res.status(401).json({
          success: false,
          error: { message: 'User is not signed in' }
        })
      }
    }
  }
])

async function signIn (req: Request, user: User): Promise<void> {
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
}

async function signOut (req: Request): Promise<void> {
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
