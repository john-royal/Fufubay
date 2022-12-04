import { Auction, AuctionStatus, Bid, User } from '@prisma/client'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import BidModal from '../../../components/bids/bid-form'
import { BidItem } from '../../../components/bids/bid-item'
import { makeImageUrl } from '../../../lib/images'
import request from '../../../lib/request'

type UserBid = Bid & { user: User }
type SellerAuction = Auction & { seller: User, bids: UserBid[] }

interface Props {
  initialValue: SellerAuction
  fallback: {
    [url: string]: SellerAuction
  }
}

const url = (id: Auction['id']) => `http://localhost:8080/api/auctions/${id}?include=bids,seller`

export default function AuctionPage ({ initialValue }: Props) {
  const [bidding, setBidding] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [bid, setBid] = useState(0)
  const { data: auction, mutate } = useSWR<SellerAuction>(url(initialValue.id), async url => {
    return await request({ method: 'GET', url })
  })

  useEffect(() => {
    if (auction?.bids != null) {
      const bid = auction.bids.reduce((max, bid) => Math.max(max, bid.amount), 0)
      setBid(bid)
    }
  }, [auction?.bids])

  useEffect(() => {
    if (bidding) {
      setRefresh(true)
    } else if (refresh) {
      setRefresh(false)
      void mutate()
    }
  }, [refresh, bidding, mutate])

  if (auction == null) return <></>

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
                  <strong className="is-capitalized">{auction.endsAt != null ? formatDistanceToNow(new Date(auction.endsAt)) : 'N/A'}</strong>
                </p>
              </div>
              <div className="level-item">
                <p>
                  <span className="has-text-grey">High Bid: </span>
                  <strong>${bid.toString() ?? '0'}</strong>
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
            <BidItem bid={bid} key={bid.id} />
            // TODO: Add a way to select the winning bidder here.
          ))}
        </ul>
      </main>
    </div>
  )
}

export async function getServerSideProps ({ params, req }: { params: { id: number, slug: string } } & GetServerSidePropsContext): Promise<GetServerSidePropsResult<Props>> {
  const auction = await request<SellerAuction>({
    method: 'GET',
    url: url(params.id),
    headers: { Cookie: req.headers.cookie }
  })
  if (params.slug === auction.slug) {
    return {
      props: {
        initialValue: auction,
        fallback: {
          [url(auction.id)]: auction
        }
      }
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
