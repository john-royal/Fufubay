import { User } from '@prisma/client'
import useForm from '../../lib/form'
import useUser from '../../lib/user'
import { SetScreen } from '.'
import { Button, Form, TextField } from '../form'

export default function CreateAccountForm ({ setScreen }: { setScreen: SetScreen }) {
  const { setUser } = useUser({ redirect: false })

  const { register, submit } = useForm<User>({
    method: 'POST',
    url: '/api/users'
  }, {
    username: '',
    email: '',
    password: ''
  }, async user => {
    await setUser(user)
  })

  return (
    <>
      <h1 className='title'>Create an Account</h1>
      <p className='subtitle'>or <a onClick={e => setScreen('sign-in')}>Sign In</a></p>

      <Form onSubmit={submit}>
        <TextField title='Username' type='text' {...register('username')} />
        <TextField title='Email Address' type='email' {...register('email')} />
        <TextField title='Password' type='password' {...register('password')} />
        <Button title='Create Account' className='is-fullwidth' />
      </Form>
    </>
  )
}
