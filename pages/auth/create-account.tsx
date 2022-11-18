import Link from 'next/link'
import { User } from '@prisma/client'
import useForm from '../../lib/form'
import { useRouter } from 'next/router'
import { useUser } from '../../lib/user'

export default function CreateAccount () {
  const router = useRouter()
  const [, setUser] = useUser()
  const { error, register, submit } = useForm<User>('/api/auth/create-account', {
    email: '',
    password: ''
  }, async user => {
    await setUser(user)
    await router.push(router.query.redirect as string ?? '/auth/profile')
  })

  return (
    <main>
      <h1>Create a Fufubay Account</h1>
      {error === '' ? '' : <p>Error: {error}</p>}
      <form onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input type="email" {...register('email')} required />
        <label htmlFor="password">Password</label>
        <input type="password" {...register('password')} required />
        <button type="submit">Sign In</button>
      </form>
      <p>
        <Link href='/'>Home</Link>, <Link href={{ pathname: '/auth/sign-in', query: router.query }}>Sign In</Link>
      </p>
    </main>
  )
}
