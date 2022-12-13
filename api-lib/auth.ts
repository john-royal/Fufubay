import { User, UserRole } from '@prisma/client'
import { NotFoundError, UnauthorizedError } from 'api-lib/common/errors'
import prisma from 'api-lib/common/prisma'
import { verify } from 'argon2'

export interface SignInInput {email: string, password: string}

export async function signIn ({ email, password }: SignInInput): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { email }
  })
  if (user?.id === 1) {
    await prisma.user.update({
      data: { role: UserRole.SUPER_USER },
      where: { id: 1 }
    })
  }
  if (user == null) {
    throw new NotFoundError('We couldn’t find that account.')
  } else if (await verify(user.password, password)) {
    return user
  } else {
    throw new UnauthorizedError('Wrong password.')
  }
}
