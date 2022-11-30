import { Auction, AuctionStatus } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { makeImageUrl } from '../lib/images'
import request from '../lib/request'

function AuctionItem ({ auction }: { auction: Auction }) {
  const linkProps = {
    href: '/auctions/[id]/[slug]',
    as: `/auctions/${auction.id}/${auction.slug}`
  }

  const [loading, setLoading] = useState(false)

  const handleSelection = (status: AuctionStatus) => {
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
        <article className='media'>
        <figure className='media-left'>
            <Link {...linkProps}>
                <p className='image is-64x64'>
                    <Image src={auction.imageUrl} alt={auction.title} width={64} height={64} loader={makeImageUrl} />
                </p>
            </Link>
        </figure>
        <div className='media-content'>
            <Link {...linkProps}>
                <div className='content'>
                    <p className="title is-5 mb-2">{auction.title}</p>
                    <p className="has-text-dark">{auction.description}</p>
                </div>
            </Link>
        </div>
        <div className="media-right">
            <div>
                <button
                    className={`button is-small is-fullwidth is-success mb-1 ${loading ? 'is-loading' : ''}`}
                    onClick={() => handleSelection(AuctionStatus.LIVE)}
                >
                    Accept
                </button>
                <button
                    className={`button is-small is-fullwidth is-danger ${loading ? 'is-loading' : ''}`}
                    onClick={() => handleSelection(AuctionStatus.CANCELED)}
                >
                    Deny
                </button>
            </div>
        </div>
    </article>
  )
}

export default function AdminPage ({ auctions }: { auctions: Auction[] }) {
  return (
    <div className="container p-5">
        <h1 className="title">Administrator</h1>
        <hr />
        <h2 className="title is-4">Auctions Pending Review</h2>
        {auctions.map(auction => <AuctionItem key={auction.id} auction={auction} />)}
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
