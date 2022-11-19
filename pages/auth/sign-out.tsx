import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { get } from '../../lib/request'
import useUser from '../../lib/user'

export default function SignOut () {
  const router = useRouter()
  const [, setUser] = useUser()
  useEffect(() => {
    get('/api/auth/sign-out')
      .then(async () => {
        setUser(null)
        await router.replace(router.query.redirect as string ?? '/')
      })
      .catch(err => alert(err))
  })

  return (<></>)
}
