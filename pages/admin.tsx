import { Auction, AuctionStatus } from '@prisma/client'
import { useState } from 'react'
import AuctionRow from '../components/auctions/auction-row'
import request from '../lib/request'

export default function AdminPage ({ auctions }: { auctions: Auction[] }) {
  const [loading, setLoading] = useState(false)

  const handleSelection = (auction: Auction, status: AuctionStatus) => {
    setLoading(true)

    const body: Partial<Auction> = { status }

    if (status === AuctionStatus.LIVE) {
      const MILLISECONDS_IN_A_WEEK = 7 * 24 * 60 * 60 * 1000
      body.startsAt = new Date()
      body.endsAt = new Date(Date.now() + MILLISECONDS_IN_A_WEEK)
    }

    request({
      method: 'PATCH',
      url: `/api/auctions/${auction.id}`,
      body
    })
      .catch(err => alert(err))
      .finally(() => setLoading(false))
  }

  return (
    <div className="container p-5">
      <h1 className="title">Administrator</h1>
      <hr />
      <h2 className="title is-4">Auctions Pending Review</h2>
      {auctions.map(auction => <AuctionRow key={auction.id} auction={auction}>
        <div>
          <button
            className={`button is-small is-fullwidth is-success mb-1 ${loading ? 'is-loading' : ''}`}
            onClick={() => handleSelection(auction, AuctionStatus.LIVE)}
          >
            Accept
          </button>
          <button
            className={`button is-small is-fullwidth is-danger ${loading ? 'is-loading' : ''}`}
            onClick={() => handleSelection(auction, AuctionStatus.CANCELED)}
          >
            Deny
          </button>
        </div>
      </AuctionRow>)}
      <hr />
      <h2 className="title is-4">Users Pending Review</h2>
      <hr />
    </div>
  )
}

export async function getServerSideProps () {
  const [auctions] = await Promise.all([
    request({ method: 'GET', url: 'http://localhost:8080/api/auctions?status=PENDING_REVIEW' })
  ])
  return { props: { auctions } }
}
