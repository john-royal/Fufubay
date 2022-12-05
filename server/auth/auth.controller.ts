import { User } from '@prisma/client'
import { verify } from 'argon2'
import { NotFoundError, prisma, UnauthorizedError } from '../common'

export default class AuthController {
  async signIn ({ email, password }: { email: string, password: string }): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (user == null) {
      throw new NotFoundError('We couldn’t find that account.')
    } else if (await verify(user.password, password)) {
      return user
    } else {
      throw new UnauthorizedError('Wrong password.')
    }
  }
}
