import { Response as RawResponse } from 'express'
import { User } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user: User | null
      signIn: (user: User) => Promise<void>
      signOut: () => Promise<void>
    }
    interface Response {
      success: <T>(data: T) => RawResponse
      created: <T>(data: T) => RawResponse
      badRequest: () => RawResponse
      unauthorized: (message?: string) => RawResponse
      notFound: (message?: string) => RawResponse
      internalServerError: (error: Error) => RawResponse
    }
  }
}
