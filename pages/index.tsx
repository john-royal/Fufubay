import { Auction } from '@prisma/client'
import Link from 'next/link'
import { get } from '../lib/request'

export async function getServerSideProps () {
  const response = await get<Auction[]>('/api/auctions')
  return {
    props: { auctions: response.success ? response.data : [] }
  }
}

export default function Home ({ auctions }: { auctions: Auction[] }) {
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
      <ul>
        <li><Link href='/auth/sign-in'>Sign In</Link></li>
        <li><Link href='/auth/create-account'>Create an Account</Link></li>
        <li><Link href='/auctions/create'>New Auction</Link></li>
      </ul>
    </main>
  )
}
