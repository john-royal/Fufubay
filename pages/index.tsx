import { Auction } from '@prisma/client'
import { useState } from 'react'
import AuctionItem from '../components/auctions/auction-item'
import Categories from '../components/auctions/categories'
import Search from '../components/layout/search'
import request from '../lib/request'

export async function getServerSideProps () {
  const auctions = await request<Auction[]>({
    method: 'GET',
    url: 'http://localhost:8080/api/auctions?status=LIVE'
  })
  return {
    props: { auctions }
  }
}

function batch<T> (items: T[], size: number): T[][] {
  const matrix: T[][] = []
  let i = 0
  let row = 0
  let col = 0
  while (i < items.length) {
    if (!Array.isArray(matrix[row])) {
      matrix.push([])
    }
    matrix[row][col] = items[i]
    col++
    if (col === size) {
      row++
      col = 0
    }
    i++
  }
  return matrix
}

export default function Home ({ auctions: initialValue }: { auctions: Auction[] }) {
  const [auctions, setAuctions] = useState<Auction[][]>(batch(initialValue, 4))

  const handleSearch = async (query: string) => {
    const url = new URL('/api/auctions?status=LIVE', window.location.origin)
    if (query.length > 0) {
      url.searchParams.set('search', query)
    }
    const result = await request<Auction[]>({
      method: 'GET',
      url: url.toString()
    })
    setAuctions(batch(result, 4))
  }

  return (
    <>
      <Search onSubmit={handleSearch} />
      <main className='container mx-auto'>
        <Categories />
        <br/>
        {auctions.map((row, i) => (
          <div key={i} className="columns mx-auto">
            {row.map(auction => (
              <div key={auction.id} className="column is-3 is-fullwidth-mobile mx-auto">
                <AuctionItem auction={auction} />
              </div>
            ))}
          </div>
        ))}
      </main>
    </>
  )
}
