import Link from 'next/link'
import { User } from '@prisma/client'
import useForm from '../../lib/form'
import { useRouter } from 'next/router'
import { useUser } from '../../lib/user'

export default function SignIn () {
  const router = useRouter()
  const [, setUser] = useUser()
  const { error, register, submit } = useForm<User>('/api/auth/sign-in', {
    email: '',
    password: ''
  }, async user => {
    await setUser(user)
    await router.push(router.query.redirect as string ?? '/auth/profile')
  })

  return (
    <div className='container forms'>
      <div className='form login'>
          <h1 className='head'>Sign In</h1>

          {error === '' ? '' : <p>Error: {error}</p>}

          <form onSubmit={submit}>
              <div className='field input-field'>
                  <input type='email' {...register('email')} className='input' placeholder='Email' required />
              </div>
              <div className='field input-field'>
                  <input type='password' {...register('password')} className='password' placeholder='Password'required />
              </div>
              <div className='form link'>
                  <Link href='/auth/forgot-password' className='forgot-pass'>Forgot password?</Link>
              </div>
              <div className='field input-field'>
                  <button>Sign In</button>
              </div>

              <div className='form link'>
                <Link href='/'>Home</Link>, <Link href={{ pathname: '/auth/create-account', query: router.query }}>Create an Account</Link>
              </div>
          </form>
      </div>
    </div>
  )
}
