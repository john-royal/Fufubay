import { Auction } from '@prisma/client'
import { GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import { get } from '../lib/request'

export async function getServerSideProps ({ req }: GetServerSidePropsContext) {
  const response = await get<Auction[]>('/api/auctions')
  return {
    props: {
      auctions: response.success ? response.data : []
    }
  }
}

export default function Home ({ auctions }: { auctions: Auction[] }) {
  return (
    <main className='container mt-5'>
      <ul>
      {auctions.map(auction =>
        <li key={auction.id}>
          <Link href={`/auctions/${auction.id}`}>{auction.title}</Link>
        </li>
      )}
      </ul>
      <Link href='/auctions/create' className='button'>Create a new auction</Link>
    </main>
  )
}
