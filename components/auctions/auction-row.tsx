import { Auction, AuctionStatus } from '@prisma/client'
import Image from 'next/image'
import { ReactNode } from 'react'
import { makeImageUrl } from '../../lib/images'
import AuctionLink from './auction-link'

export default function AuctionRow ({ auction, children }: { auction: Auction, children?: ReactNode }) {
  return (
    <article className='media'>
        <figure className='media-left'>
            <AuctionLink auction={auction}>
                <p className='image is-96x96'>
                    <Image src={auction.imageUrl} alt={auction.title} width={96} height={96} loader={makeImageUrl} />
                </p>
            </AuctionLink>
        </figure>
        <div className='media-content'>
            <AuctionLink auction={auction}>
                <div className='content'>
                    <div className='content'>
                        <p className="title is-6 mb-1">{auction.title}</p>
                        <p className="is-size-7 has-text-dark">{auction.description}</p>
                        <StatusTag auction={auction} />
                    </div>
                </div>
            </AuctionLink>
        </div>
        <div className="media-right">
            {children}
        </div>
    </article>
  )
}

function StatusTag ({ auction }: { auction: Auction }) {
  const className = (...classes: string[]): string => ['tag', 'has-text-weight-semibold', ...classes].join(' ')

  switch (auction.status) {
    case AuctionStatus.CANCELED:
      return <span className={className('is-danger')}>Canceled</span>
    case AuctionStatus.LIVE:
      return (
        <div className='tags'>
            <span className={className('is-primary')}>Live</span>
            <span className='tag is-white has-text-dark'>Ends {auction.endsAt?.toLocaleDateString()}</span>
        </div>
      )
    case AuctionStatus.PENDING_REVIEW:
      return <span className={className()}>Pending Review</span>
    case AuctionStatus.SOLD:
      return (
        <div className='tags'>
          <span className={className('is-success')}>Sold</span>
          <span className='tag is-white has-text-dark'>{auction.endsAt?.toLocaleDateString()}</span>
        </div>
      )
  }
}
