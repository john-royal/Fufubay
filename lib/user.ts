import { User } from '@prisma/client'
import { verify } from 'jsonwebtoken'

export default function getUser (token: string | undefined): User | null {
  try {
    return verify(token ?? '', process.env.JWT_SECRET ?? '') as User
  } catch (error) {
    return null
  }
}
