import Link from 'next/link'

export default function CreateAccount () {
  return (
    <main>
      <h1>Create a Fufubay Account</h1>
      <p>
        <Link href='/'>Home</Link>, <Link href='/auth/sign-in'>Sign In</Link>
      </p>
    </main>
  )
}
