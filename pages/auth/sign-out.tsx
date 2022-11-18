import Router from 'next/router'
import { useEffect } from 'react'
import { get } from '../../lib/request'

export default function SignOut () {
  useEffect(() => {
    get('/api/auth/sign-out')
      .then(async () => await Router.replace('/'))
      .catch(err => alert(err))
  })

  return (<></>)
}
