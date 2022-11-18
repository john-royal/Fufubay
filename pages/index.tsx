import { Auction, User } from '@prisma/client'
import { GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import { get } from '../lib/request'
import getUser from '../lib/user'

export async function getServerSideProps ({ req }: GetServerSidePropsContext) {
  const user = getUser(req.cookies.token)
  const response = await get<Auction[]>('/api/auctions')
  return {
    props: {
      auctions: response.success ? response.data : [],
      user
    }
  }
}

export default function Home ({ auctions, user }: { auctions: Auction[], user?: User }) {
  return (
    <main>
      <h1>Fufubay</h1>
      <h2>Auctions</h2>
      <ul>
      {auctions.map(auction =>
        <li key={auction.id}>
          <a href={`/auctions/${auction.id}`}>{auction.title}</a>
        </li>
      )}
      </ul>
      <h2>Links</h2>
      <ul style={{ display: user != null ? 'block' : 'none' }}>
        <li><Link href='/auth/profile'>My Profile</Link></li>
        <li><Link href='/auctions/create'>New Auction</Link></li>
        <li><Link href='/auth/sign-out'>Sign Out</Link></li>
      </ul>
      <ul style={{ display: user == null ? 'block' : 'none' }}>
        <li><Link href='/auth/sign-in'>Sign In</Link></li>
        <li><Link href='/auth/create-account'>Create an Account</Link></li>
        <li><Link href='/auctions/create'>New Auction</Link></li>
      </ul>
    </main>
  )
}
