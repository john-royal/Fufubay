import { Auction, AuctionStatus, Prisma } from '@prisma/client'
import { GetServerSidePropsContext } from 'next'
import Router from 'next/router'
import AuctionItem from '../components/auctions/auction-item'
import Categories from '../components/auctions/categories'
import Search from '../components/layout/search'
import prisma from '../lib/prisma'

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
    const url = new URL(Router.asPath, Router.basePath)
    url.searchParams.set('search', search)
    await Router.push(url)
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

export async function getServerSideProps ({ query }: GetServerSidePropsContext) {
  const where: Prisma.AuctionWhereInput = {
    status: AuctionStatus.LIVE
  }
  if (typeof query.search === 'string') {
    const search = (() => {
      const parts = query.search.split(/\s+/)
      if (parts.length > 1) {
        return parts
          .map(term => `'${term}'`)
          .join('&')
      } else {
        return query.search
      }
    })()
    where.OR = {
      title: { search },
      description: { search }
    }
  }
  const auctions = await prisma.auction.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  })
  return {
    props: { auctions }
  }
}
