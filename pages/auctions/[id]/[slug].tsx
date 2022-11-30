import { Auction, AuctionStatus, Bid, User } from '@prisma/client'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import BidModal from '../../../components/auctions/bid-form'
import { makeImageUrl } from '../../../lib/images'
import request from '../../../lib/request'

interface SellerAuction extends Auction {
  seller: User
}

interface UserBid extends Bid {
  user: User
}

export default function AuctionPage ({ auction }: { auction: SellerAuction }) {
  const [bidding, setBidding] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const { data, mutate } = useSWR<{ max: Number, bids: UserBid[] }>(`/api/bids?auctionId=${auction.id}&include=user`, async url => {
    const bids = await request<UserBid[]>({ method: 'GET', url })
    const max = bids.reduce((max, bid) => Math.max(max, bid.amount), 0)
    return { max, bids }
  })

  useEffect(() => {
    if (bidding) {
      setRefresh(true)
    }
  }, [bidding])

  useEffect(() => {
    if (refresh && !bidding) {
      setRefresh(false)
      void mutate()
    }
  }, [refresh, bidding, mutate])

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
        <h1 className="title">{auction.title}</h1>
        <p className="subtitle">{auction.description}</p>
        <figure className="image">
          <Image src={auction.imageUrl} alt={auction.title} width={760} height={540} priority loader={makeImageUrl} />
        </figure>

        <div className="level mt-1">
          <div className="level-left mr-1 is-flex-grow-1">
            <div className="notification is-dark level is-flex-grow-1" style={{ maxHeight: 60 }}>
              <div className="level-item">
                <p>
                  <span className="has-text-grey">Auction Ends: </span>
                  <strong>{auction.endsAt != null ? new Date(auction.endsAt).toLocaleDateString() : 'N/A'}</strong>
                </p>
              </div>
              <div className="level-item">
                <p>
                  <span className="has-text-grey">High Bid: </span>
                  <strong>${data?.max.toString() ?? '0'}</strong>
                </p>
              </div>
              <div className="level-item">
                <p>
                  <span className="has-text-grey">Bids: </span>
                  <strong>{data?.bids.length.toString() ?? '0'}</strong>
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
          {(data?.bids ?? []).map(bid => (
            <BidItem bid={bid} key={bid.id} />
          ))}
        </ul>
      </main>
    </div>
  )
}

function BidItem ({ bid }: { bid: UserBid }) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  })
  const linkProps = {
    href: '/users/[id]/[slug]',
    as: `/users/${bid.user.id}/${bid.user.username}`
  }

  return (<article className='media'>
  <figure className='media-left'>
    <p className='image is-64x64'>
      <Link {...linkProps}>
        <Image src={bid.user.imageUrl} alt={bid.user.username} width={64} height={64} className='is-rounded' loader={makeImageUrl} />
      </Link>
    </p>
  </figure>
  <div className='media-content'>
    <div className='content'>
      <p className='mb-1'>
        <Link {...linkProps} className='has-text-dark has-text-weight-bold'>{bid.user.username}</Link> <small>{new Date(bid.date).toLocaleDateString()}</small>
      </p>
      <p className="tag is-dark is-medium">
        <span className="has-text-grey">Bid&nbsp;</span>
        <strong className="has-text-white">{formatter.format(bid.amount)}</strong>
      </p>
    </div>
  </div>
</article>)
}

export async function getServerSideProps ({ params: { id, slug }, req }: { params: { id: string, slug: string } } & GetServerSidePropsContext): Promise<GetServerSidePropsResult<{ auction: SellerAuction }>> {
  const auction = await request<SellerAuction>({
    method: 'GET',
    url: `http://localhost:8080/api/auctions/${id}`,
    headers: { Cookie: req.headers.cookie }
  })
  if (slug !== auction.slug) {
    return {
      redirect: {
        destination: `/auctions/${auction.id}/${auction.slug}`,
        permanent: true
      }
    }
  }
  return {
    props: { auction }
  }
}
