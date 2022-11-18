import { User } from '@prisma/client'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import Link from 'next/link'
import getUser from '../../lib/user'

export function getServerSideProps ({ req }: GetServerSidePropsContext): GetServerSidePropsResult<{ user: User }> {
  const user = getUser(req.cookies.token)
  if (user != null) {
    return { props: { user } }
  } else {
    return { redirect: { destination: '/auth/sign-in', permanent: false } }
  }
}

export default function Profile ({ user }: { user: User }) {
  return (
    <>
      <h1>User Profile</h1>
      <p>{JSON.stringify(user)}</p>
      <Link href='/auth/sign-out'>Sign Out</Link>
    </>
  )
}
