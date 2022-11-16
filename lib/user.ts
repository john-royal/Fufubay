import useSWR from 'swr'
import Router from 'next/router'
import { User } from '@prisma/client'
import { get } from './request'
import { useEffect } from 'react'

type UserMutator = (user?: User) => Promise<void>

export function useUser (): [User | undefined, UserMutator] {
  const { data: user, mutate } = useSWR('/api/auth/user', async url => {
    const response = await get<User>(url)
    if (response.success) {
      return response.data
    } else {
      throw new Error(response.error.message)
    }
  })

  async function setUser (user?: User): Promise<void> {
    await mutate(user)
    if (user == null) {
      await get('/api/auth/sign-out')
      await Router.push('/auth/sign-in')
    }
  }

  return [user, setUser]
}

export function useAuthenticatedUser (): [User, UserMutator] {
  const [user, setUser] = useUser()
  useEffect(() => {
    if (user == null) void Router.replace('/auth/sign-in')
  })
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return [user!, setUser]
}
