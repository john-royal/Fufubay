import { Auction } from '@prisma/client'
import { useState } from 'react'
import AuctionItem from '../components/auctions/auction-item'
import Categories from '../components/auctions/categories'
import Search from '../components/layout/search'
import request, { get } from '../lib/request'

export async function getServerSideProps () {
  const response = await get<Auction[]>('http://localhost:8080/api/auctions')
  return {
    props: {
      auctions: response.success ? response.data : []
    }
  }
}

export default function Home ({ auctions: initialValue }: { auctions: Auction[] }) {
  const [auctions, setAuctions] = useState<Auction[]>(initialValue)

  const handleSearch = async (query: string) => {
    const url = new URL('/api/auctions', window.location.origin)
    if (query.length > 0) {
      url.searchParams.set('search', query)
    }
    const result = await request<Auction[]>({
      method: 'GET',
      url: url.toString()
    })
    setAuctions(result)
  }

  return (
    <>
      <Search onSubmit={handleSearch} />
      <main className='container m-5'>
        <Categories />
        <br/>
        {auctions.map(auction =>
          <AuctionItem key={auction.id} auction={auction} />
        )}
      </main>
    </>
  )
}
