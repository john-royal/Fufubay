import prisma from '../prisma'
import router from './router'
import * as scrypt from '../util/scrypt'

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
      res.status(201).json({
        success: true,
        data: {
          user
        }
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
        res.status(200).json({
          success: true,
          data: {
            user
          }
        })
      } else if (user != null) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Wrong password'
          }
        })
      } else {
        res.status(404).send({
          success: false,
          error: {
            message: 'User not found'
          }
        })
      }
    }
  }
])
