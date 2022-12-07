import { User } from '@prisma/client'
import Router from 'next/router'
import { useEffect } from 'react'
import useSWR, { KeyedMutator } from 'swr'
import request from './request'

export default function useUser (options: RedirectOptions = { redirect: 'unauthenticated', to: '/' }): { user: User | undefined, setUser: KeyedMutator<User> } {
  const { data: user, mutate: setUser, isValidating } = useSWR<User>('/api/users/me', async url => {
    return await request({ method: 'GET', url })
  })

  useEffect(() => {
    if (options.redirect === false || isValidating) return

    if (user == null && options.redirect === 'unauthenticated') {
      void Router.push(`${options.to}?redirect=${Router.asPath}`)
    } else if (user != null && options.redirect === 'authenticated') {
      void Router.push(options.to)
    }
  }, [user, options, isValidating])

  return { user, setUser }
}

export interface DisableRedirectOptions {
  redirect: false
}

export interface EnableRedirectOptions {
  redirect: 'authenticated' | 'unauthenticated'
  to: string
}

export type RedirectOptions = DisableRedirectOptions | EnableRedirectOptions
