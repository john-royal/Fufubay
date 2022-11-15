import Link from 'next/link'

export default function Home () {
  return (
    <main>
      <h1>Fufubay</h1>
      <p>
        <Link href='/auth/sign-in'>Sign In</Link> or <Link href='/auth/create-account'>Create an Account</Link>
      </p>
    </main>
  )
}
