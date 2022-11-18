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
      await req.signIn(user)
      return res.created(user)
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
        await req.signIn(user)
        return res.success(user)
      } else if (user == null) {
        return res.notFound()
      } else {
        return res.unauthorized('Wrong password')
      }
    }
  },
  {
    method: 'get',
    path: '/sign-out',
    async handler (req, res) {
      await req.signOut()
      return res.success(null)
    }
  }
])
