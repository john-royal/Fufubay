import Router from 'next/router'
import { useEffect } from 'react'
import useUser from '../../lib/user'

export default function Profile () {
  const [user] = useUser()

  useEffect(() => {
    if (user == null) void Router.replace('/auth/sign-in')
  })

  return (
    <div className='container mt-5'>
      <h1 className='title'>User Profile</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
