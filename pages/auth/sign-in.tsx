import Link from 'next/link'

export default function SignIn () {
  return (
    <main>
      <h1>Sign In to Fufubay</h1>
      <p>
        <Link href='/'>Home</Link>, <Link href='/auth/create-account'>Create an Account</Link>
      </p>
    </main>
  )
}
