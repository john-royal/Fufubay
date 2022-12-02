import { User } from '@prisma/client'
import { NotFoundError, prisma, scrypt, UnauthorizedError } from '../common'

export default class AuthController {
  async signIn ({ email, password }: { email: string, password: string }): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (user == null) {
      throw new NotFoundError('We couldn’t find that account.')
    }
    const isAuthenticated = await scrypt.compare(password, user.password)
    if (!isAuthenticated) {
      throw new UnauthorizedError('Wrong password.')
    }
    return user
  }
}
