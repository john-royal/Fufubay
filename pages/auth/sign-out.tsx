import Router from 'next/router'
import { useEffect } from 'react'
import { get } from '../../lib/request'
import useUser from '../../lib/user'

export default function SignOut () {
  const [, setUser] = useUser()
  useEffect(() => {
    get('/api/auth/sign-out')
      .then(async () => {
        setUser(null)
        await Router.replace('/')
      })
      .catch(err => alert(err))
  })

  return (<></>)
}
