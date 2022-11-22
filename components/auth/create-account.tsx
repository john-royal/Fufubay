import { User } from '@prisma/client'
import useForm from '../../lib/form'
import useUser from '../../lib/user'
import { SetScreen } from '.'

export default function CreateAccountForm ({ setScreen }: { setScreen: SetScreen }) {
  const [, setUser] = useUser()
  const { error, register, submit, working } = useForm<User>('/api/users', {
    username: '',
    email: '',
    password: ''
  }, async user => {
    setUser(user)
    setScreen(null)
  })

  return (
    <>
      <h1 className='title'>Create an Account</h1>
      <p className='subtitle'>or <a onClick={e => setScreen('sign-in')}>Sign In</a></p>
      <div className='form'>

      <div className={'notification is-danger' + (error === '' ? ' is-hidden' : '')}><strong>{error}</strong> Please try again.</div>

        <form onSubmit={submit}>
          <div className='field'>
            <label htmlFor='username' className='label'>Username</label>
            <div className='control'>
              <input type='text' {...register('username')} className='input' placeholder='Username' required />
            </div>
          </div>
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
              <button className={`button is-primary is-fullwidth ${working ? 'is-loading' : ''}`}>Create Account</button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
