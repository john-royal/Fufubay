import { Auction, AuctionStatus, Bid, User } from '@prisma/client'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { GetServerSidePropsResult } from 'next'
import Image from 'next/image'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import BidModal from '../../../components/bids/bid-form'
import { BidItem } from '../../../components/bids/bid-item'
import { makeImageUrl } from '../../../lib/images'
import prisma from '../../../lib/prisma'
import request from '../../../lib/request'
import useUser from '../../../lib/user'

type UserBid = Bid & { user: User }
type SellerAuction = Auction & { seller: User, bids: UserBid[], highBid: number }

export default function AuctionPage ({ auction }: { auction: SellerAuction }) {
  const { user } = useUser({ redirect: false })
  const [bidding, setBidding] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (bidding) {
      setRefresh(true)
    } else if (refresh) {
      setRefresh(false)
      void Router.replace(Router.asPath)
    }
  }, [refresh, bidding])

  if (auction == null) return <></>

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
    <div className='container p-5 mx-auto'>
      <BidModal isActive={bidding} handleClose={() => setBidding(false)} auctionId={auction.id} />

      {/* TODO: Add some quick options (e.g. accept, deny, cancel) for admins here. */}
      {auction.status === AuctionStatus.PENDING_REVIEW
        ? (
        <div className="notification is-dark">
          <p>This auction is pending review.</p>
        </div>
          )
        : <></>}

      <main className="column is-two-thirds-desktop">
        <header className='block'>
          <h1 className="title">{auction.title}</h1>
          <p className="subtitle">{auction.description}</p>
          <figure className="image is-4by3">
            <Image src={auction.imageUrl} alt={auction.title} width={740} height={555} priority loader={makeImageUrl} />
          </figure>
        </header>

        <div className="level is-mobile block">
          <div className="level-left mr-1 is-flex-grow-1">
            <div className="notification is-dark level is-mobile is-flex-grow-1" style={{ maxHeight: 60 }}>
              <div className="level-item">
                <p>
                  <span className="has-text-grey">Time Left: </span>
                  <strong className="is-capitalized">{auction.endsAt != null ? formatDistanceToNow(auction.endsAt) : 'N/A'}</strong>
                </p>
              </div>
              <div className="level-item">
                <p>
                  <span className="has-text-grey">High Bid: </span>
                  <strong>${auction.highBid.toString() ?? '0'}</strong>
                </p>
              </div>
              <div className="level-item is-hidden-mobile">
                <p>
                  <span className="has-text-grey">Bids: </span>
                  <strong>{auction.bids.length.toString() ?? '0'}</strong>
                </p>
              </div>
            </div>
          </div>
          <div className="level-right ml-1">
            <button className="button is-primary is-large" onClick={() => setBidding(true)}>Bid</button>
          </div>
        </div>

        <h2 className="title is-3">Bids</h2>
        <ul className='list'>
          {auction.bids.map(bid => (
            <BidItem bid={bid} key={bid.id}>
              {user?.id === auction.sellerId && auction.endsAt != null && Date.now() > auction.endsAt.getTime() && auction.status !== AuctionStatus.SOLD
                ? (
                    <button className={`button is-small ${loading ? 'is-loading' : ''}`} onClick={() => handleFinalize(bid.id)}>Select Winning Bid</button>
                  )
                : <></>}
            </BidItem>
          ))}
        </ul>
      </main>
    </div>
  )
}

export async function getServerSideProps ({ params }: { params: { id: number, slug: string } }): Promise<GetServerSidePropsResult<{ auction: SellerAuction }>> {
  const auction = await prisma.auction.findUniqueOrThrow({
    include: { seller: true, bids: { include: { user: true } } },
    where: { id: Number(params.id) }
  })
  Object.assign(auction, { highBid: auction.bids.reduce((acc, bid) => Math.max(acc, bid.amount), 0) })
  if (params.slug === auction.slug) {
    return {
      props: { auction: auction as SellerAuction }
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
