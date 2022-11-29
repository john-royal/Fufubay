import Router from 'next/router'
import { useEffect } from 'react'
import useSWR, { KeyedMutator } from 'swr'
import { User } from '../shared/types'
import request from './request'

export default function useUser (options: RedirectOptions = { redirect: 'unauthenticated', to: '/' }): { user: User | undefined, setUser: KeyedMutator<User> } {
  const { data: user, mutate: setUser } = useSWR<User>('/api/users/me', async url => {
    return await request({ method: 'GET', url })
  })

  useEffect(() => {
    if (options.redirect === false) return

    if (user == null && options.redirect === 'unauthenticated') {
      void Router.push(`${options.to}?redirect=${Router.asPath}`)
    } else if (user != null && options.redirect === 'authenticated') {
      void Router.push(options.to)
    }
  }, [user, options])

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
