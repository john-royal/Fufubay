import { Auction } from '@prisma/client'
import AuctionItem from '../components/auction-item'
import Categories from '../components/categories'
import { get } from '../lib/request'

export async function getServerSideProps () {
  const response = await get<Auction[]>('http://localhost:8080/api/auctions')
  return {
    props: {
      auctions: response.success ? response.data : []
    }
  }
}

export default function Home ({ auctions }: { auctions: Auction[] }) {
  return (
    <main className='container m-5'>
      <Categories />
      {auctions.map(auction =>
        <AuctionItem key={auction.id} auction={auction} />
      )}
    </main>
  )
}
