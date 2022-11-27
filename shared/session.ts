import { User } from './types'
import { IronSessionOptions } from 'iron-session'

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'fufubay-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
}

declare module 'iron-session' {
  interface IronSessionData {
    user?: User
  }
}
