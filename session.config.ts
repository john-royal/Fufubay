import { User } from '@prisma/client'
import { IronSessionOptions } from 'iron-session'

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'fufubay-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
}

declare module 'iron-session' {
  interface IronSessionData {
    user?: User
  }
}
