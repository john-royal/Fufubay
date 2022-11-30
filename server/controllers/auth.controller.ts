import { User } from '../../shared/types'
import { NotFoundError, UnauthorizedError } from '../errors'
import prisma from '../prisma'
import { compare } from '../util/scrypt'

export default class AuthController {
  async signIn ({ email, password }: { email: string, password: string }): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (user == null) {
      throw new NotFoundError('We couldn’t find that account.')
    }
    const isAuthenticated = await compare(password, user.password)
    if (!isAuthenticated) {
      throw new UnauthorizedError('Wrong password.')
    }
    return user as unknown as User
  }
}
