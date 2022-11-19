import { User } from '@prisma/client'
import { createContext, useContext } from 'react'

type UserState = [User | null, (user: User | null) => void]

export const AuthContext = createContext<UserState>([null, user => {}])

export default function useUser (): UserState {
  return useContext(AuthContext)
}
