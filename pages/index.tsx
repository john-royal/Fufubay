import { Auction } from '@prisma/client'
import { GetServerSidePropsContext } from 'next'
import AuctionItem from '../components/auction-item'
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
    <main className='container m-5'>
      {auctions.map(auction =>
        <AuctionItem key={auction.id} auction={auction} />
      )}
    </main>
  )
}
