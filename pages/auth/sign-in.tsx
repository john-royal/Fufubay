import { FormEvent, useState } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { User } from '@prisma/client'
import { APIResponse, post } from '../../lib/request'
import { useUser } from '../../lib/user'

export default function SignIn () {
  const [, setUser] = useUser()
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')

    const response: APIResponse<User> = await post('/api/auth/sign-in', {
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
    <div className='container forms'>
      <div className='form login'>
          <h1 className='head'>Login</h1>

          {errorMessage === '' ? '' : <p>Error: {errorMessage}</p>}

          <form onSubmit={e => { handleSubmit(e).catch(err => console.error(err)) }}>
              <div className='field input-field'>
                  <input type='email' name='email' className='input' placeholder='Email' required />
              </div>
              <div className='field input-field'>
                  <input type='password' name='password' className='password' placeholder='Password' required />
              </div>
              <div className='form link'>
                  <Link href='/auth/forgot-password' className='forgot-pass'>Forgot password?</Link>
              </div>
              <div className='field input-field'>
                  <button>Login</button>
              </div>

              <div className='form link'>
                <Link href='/'>Home</Link>, <Link href='/auth/create-account'>Create an Account</Link>
              </div>
          </form>
      </div>
    </div>
  )
}
