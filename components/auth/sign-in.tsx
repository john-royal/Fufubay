import Link from 'next/link'
import { User } from '@prisma/client'
import useForm from '../../lib/form'
import useUser from '../../lib/user'
import { SetScreen } from '.'

export default function SignInForm ({ setScreen }: { setScreen: SetScreen }) {
  const [, setUser] = useUser()
  const { error, register, submit, working } = useForm<User>('/api/auth/sign-in', {
    email: '',
    password: ''
  }, async user => {
    setUser(user)
    setScreen(null)
  })

  return (
    <>
      <h1 className='title'>Sign In</h1>
      <p className='subtitle'>or <a onClick={e => setScreen('create-account')}>Create an Account</a></p>
      <div className='form'>

        <div className={'notification is-danger' + (error === '' ? ' is-hidden' : '')}><strong>{error}</strong> Please try again.</div>

        <form onSubmit={submit}>
          <div className='field'>
            <label htmlFor='email' className='label'>Email</label>
            <div className='control'>
              <input type='email' {...register('email')} className='input' placeholder='Email' required />
            </div>
          </div>
          <div className='field'>
            <label htmlFor='password' className='label'>Password</label>
            <div className='control'>
                <input type='password' {...register('password')} className='input' placeholder='Password' required />
            </div>
          </div>
          <div className='field'>
            <div className='control'>
              <button className={`button is-primary is-fullwidth ${working ? 'is-loading' : ''}`}>Sign In</button>
            </div>
          </div>
          <div className='field'>
            <div className='control'>
              <Link className='button is-secondary is-fullwidth' href='/auth/forgot-password'>Forgot Password</Link>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
