import Link from 'next/link'
import { User } from '@prisma/client'
import useForm from '../../lib/form'
import { useRouter } from 'next/router'
import useUser from '../../lib/user'

export default function CreateAccount () {
  const router = useRouter()
  const [, setUser] = useUser()
  const { error, register, submit, working } = useForm<User>('/api/users', {
    username: '',
    email: '',
    password: ''
  }, async user => {
    setUser(user)
    await router.push(router.query.redirect as string ?? `/users/${user.id}`)
  })

  return (
    <div className='container p-6 column mt-5' style={{ maxWidth: 480 }}>
      <h1 className='title'>Create an Account</h1>
      <p className='subtitle'>or <Link href={{ pathname: '/auth/sign-in', query: router.query }}>Sign In</Link></p>
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
              <button className={`button is-primary is-fullwidth ${working ? 'is-working' : ''}`}>Create Account</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
