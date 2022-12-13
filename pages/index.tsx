import { Auction, AuctionStatus } from '@prisma/client'
import { getAuctions } from 'api-lib/auctions'
import AuctionItem from 'components/auctions/auction-item'
import Highlight from 'components/highlight'
import Search from 'components/layout/search'
import { Slider } from 'components/slider'
import { GetServerSidePropsContext } from 'next'
import Router from 'next/router'

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
  const auctions = batch(initialValue, 4)

  const handleSearch = async (search: string) => {
    await Router.push(`/?search=${encodeURIComponent(search)}`)
  }

  return (
    <>
      <Search onSubmit={handleSearch} />
      <main className='container mx-auto'>
        <br/>
        <br/>
        <Highlight slides={Slider}/>
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

export async function getServerSideProps ({ query }: GetServerSidePropsContext) {
  const auctions = await getAuctions({
    status: AuctionStatus.LIVE,
    search: query.search as string | undefined
  })
  return {
    props: { auctions }
  }
}
