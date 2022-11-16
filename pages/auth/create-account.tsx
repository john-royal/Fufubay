import { FormEvent, useState } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { User } from '@prisma/client'
import { APIResponse, post } from '../../lib/request'
import { useUser } from '../../lib/user'

export default function CreateAccount () {
  const [, setUser] = useUser()
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const response: APIResponse<User> = await post('/api/auth/create-account', {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value
    })
    if (response.success) {
      await setUser(response.data)
      await Router.push('/auth/profile')
    } else {
      setErrorMessage(response.error.message)
    }
  }

  return (
    <main>
      <h1>Create a Fufubay Account</h1>
      {errorMessage === '' ? '' : <p>Error: {errorMessage}</p>}
      <form onSubmit={e => { handleSubmit(e).catch(err => setErrorMessage(err)) }}>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" required />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" required />
        <button type="submit">Sign In</button>
      </form>
      <p>
        <Link href='/'>Home</Link>, <Link href='/auth/sign-in'>Sign In</Link>
      </p>
    </main>
  )
}
