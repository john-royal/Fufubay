import { Auction, AuctionStatus, Bid, User } from '@prisma/client'
import prisma from 'api-lib/common/prisma'
import { getSellerRating } from 'api-lib/users'
import BidModal from 'components/bids/bid-form'
import { BidItem } from 'components/bids/bid-item'
import ReviewModal from 'components/review'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { makeImageUrl } from 'lib/images'
import request from 'lib/request'
import useUser from 'lib/user'
import { GetServerSidePropsResult } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import Report from './report'

type Seller = User & { rating: number | null }
type UserBid = Bid & { user: User }
type FullAuction = Auction & { seller: Seller, bids: UserBid[], highBid: number }

export default function AuctionPage ({ auction }: { auction: FullAuction }) {
  const { user } = useUser({ redirect: false })
  const [bidding, setBidding] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    if (bidding || reviewing) {
      setRefresh(true)
    } else if (refresh) {
      setRefresh(false)
      void Router.replace(Router.asPath)
    }
  }, [refresh, reviewing, bidding])

  const handleFinalize = (id: Bid['id']) => {
    setLoading(true)

    request({
      method: 'POST',
      url: `/api/auctions/${auction.id}/finalize`,
      body: {
        winningBidId: id,
        reason: 'High bid' // TODO: Add a way to enter a reason.
      }
    })
      .then(async () => { await Router.replace(Router.asPath) })
      .catch(err => alert(err))
      .finally(() => setLoading(false))
  }

  return (
    <>
    <div className='container p-5 mx-auto'>
      <BidModal isActive={bidding} handleClose={() => setBidding(false)} auctionId={auction.id} />
      <ReviewModal sellerId={auction.seller.id} isActive={reviewing} handleClose={() => setReviewing(false)} />

      {/* TODO: Add some quick options (e.g. accept, deny, cancel) for admins here. */}
      {auction.status === AuctionStatus.PENDING_REVIEW
        ? (
          <div className='notification is-dark'>
            <p>This auction is pending review.</p>
          </div>
          )
        : <></>}

      <main className='column is-two-thirds-desktop'>
        <header className='block'>
          <h1 className='title'>{auction.title}</h1>
          <p className='subtitle'>{auction.description} <button className="button is-pulled-right button is-small button is-link" onClick={() => setReporting(true)}>Report</button></p>
          <figure className='image is-4by3'>
            <Image src={auction.imageUrl} alt={auction.title} width={740} height={555} priority loader={makeImageUrl} />
          </figure>
        </header>

        <div className='level is-mobile block'>
          <div className='level-left mr-1 is-flex-grow-1'>
            <div className='notification is-dark level is-mobile is-flex-grow-1' style={{ maxHeight: 60 }}>
              <div className='level-item'>
                <p>
                  <span className='has-text-grey'>Time Left: </span>
                  <strong className='is-capitalized'>{auction.endsAt != null ? formatDistanceToNow(auction.endsAt) : 'N/A'}</strong>
                </p>
              </div>
              <div className='level-item'>
                <p>
                  <span className='has-text-grey'>High Bid: </span>
                  <strong>${auction.highBid.toString() ?? '0'}</strong>
                </p>
              </div>
              <div className='level-item is-hidden-mobile'>
                <p>
                  <span className='has-text-grey'>Bids: </span>
                  <strong>{auction.bids.length.toString() ?? '0'}</strong>
                </p>
              </div>
            </div>
          </div>
          <div className='level-right ml-1'>
            <button className='button is-primary is-large' onClick={() => setBidding(true)}>Bid</button>
          </div>
        </div>

        <h2 className='title is-3'>Bids</h2>
        <ul className='list'>
          {auction.bids.map(bid => (
            <BidItem bid={bid} key={bid.id}>
              {user?.id === auction.sellerId && auction.endsAt != null && Date.now() > auction.endsAt.getTime() && auction.status !== AuctionStatus.SOLD
                ? (
                  <button className={`button is-small ${loading ? 'is-loading' : ''}`} onClick={() => handleFinalize(bid.id)}>Select Winning Bid</button>
                  )
                : <></>}
              <button className='button is-light is-small' onClick={() => setReviewing(true)}>Rate</button>
            </BidItem>
          ))}
        </ul>
      </main>

      <aside className='column is-one-third-desktop'>
        <p className='heading'>Sold by</p>
        <SellerPreview seller={auction.seller} />
      </aside>
    </div>
    <Report isVisible={reporting} onClose={ () => setReporting(false)} />
    </>
  )
}

export async function getServerSideProps ({ params }: { params: { id: number, slug: string } }): Promise<GetServerSidePropsResult<{ auction: FullAuction }>> {
  const auction = await prisma.auction.findUniqueOrThrow({
    include: {
      seller: true,
      bids: {
        include: { user: true },
        orderBy: { amount: 'desc' }
      }
    },
    where: { id: Number(params.id) }
  })
  if (params.slug === auction.slug) {
    const rating = await getSellerRating(auction.seller.id)
    Object.assign(auction.seller, { rating })

    const highBid = auction.bids.reduce((acc, bid) => Math.max(acc, bid.amount), 0)
    Object.assign(auction, { highBid })

    return {
      props: { auction: auction as FullAuction }
    }
  } else {
    return {
      redirect: {
        destination: `/auctions/${auction.id}/${auction.slug}`,
        permanent: true
      }
    }
  }
}

export function SellerPreview ({ seller }: { seller: Seller }) {
  const linkProps = {
    href: '/users/[id]/[slug]',
    as: `/users/${seller.id}/${seller.username}`
  }

  return (
    <article className='level'>
      <div className='level-left'>
        <figure className='level-item'>
            <p className='image is-64x64'>
                <Link {...linkProps}>
                    <Image src={seller.imageUrl} alt={seller.username} width={64} height={64} className='is-rounded' loader={makeImageUrl} />
                </Link>
            </p>
        </figure>
        <div className='level-item'>
            <div className='content'>
                <p className='mb-1'>
                    <Link {...linkProps} className='has-text-dark has-text-weight-bold'>{seller.username}</Link>
                </p>
                <p className='subtitle is-7 has-text-grey'><i className='fa-solid fa-star'></i>{' '}Rating: {seller.rating ?? 'N/A'}</p>
            </div>
        </div>
      </div>
    </article>
  )
}
