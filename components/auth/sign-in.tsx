import useForm from '../../lib/form'
import useUser from '../../lib/user'
import { SetScreen } from '.'
import { Form, TextField, Button } from '../common/form'
import { User } from '../../shared/types'

export default function SignInForm ({ setScreen }: { setScreen: SetScreen }) {
  const { setUser } = useUser({ redirect: false })
  const { register, submit } = useForm<User>({
    method: 'POST',
    url: '/api/auth/sign-in'
  }, {
    email: '',
    password: ''
  }, async user => {
    await setUser(user)
  })

  return (
    <>
      <h1 className='title'>Sign In</h1>
      <p className='subtitle'>or <a onClick={e => setScreen('create-account')}>Create an Account</a></p>

      <Form onSubmit={submit}>
        <TextField title='Email Address' type='email' {...register('email')} />
        <TextField title='Password' type='password' {...register('password')} />
        <Button title='Sign In' className='is-fullwidth' />
      </Form>
    </>
  )
}
