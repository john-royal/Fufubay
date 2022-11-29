import { Auction, Bid, User } from '@prisma/client'
import { GetServerSidePropsResult } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { makeImageUrl } from '../../../lib/images'
import request from '../../../lib/request'
import BidModal from './_bid'

interface SellerAuction extends Auction {
  seller: User
}

interface UserBid extends Bid {
  user: User
}

export async function getServerSideProps ({ params: { id, slug } }: { params: { id: string, slug: string } }): Promise<GetServerSidePropsResult<{ auction: SellerAuction }>> {
  const auction = await request<SellerAuction>({
    method: 'GET',
    url: `http://localhost:8080/api/auctions/${id}`
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

export default function AuctionPage ({ auction }: { auction: SellerAuction }) {
  const [bidding, setBidding] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const { data, mutate } = useSWR<{ max: Number, bids: UserBid[] }>(`http://localhost:8080/api/bids?auctionId=${auction.id}&include=user`, async url => {
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
    <div className='container mt-5 columns level is-centered is-variable is-1-mobile is-0-tablet is-3-desktop is-8-widescreen is-2-fullhd'>
      <BidModal isActive={bidding} handleClose={() => setBidding(false)} auctionId={auction.id} />

      <div className='column is-one-fifth'></div>
      <div className='column is-half'>
        <Image src={auction.imageUrl} alt={auction.title} width={680} height={540} priority loader={makeImageUrl} />
        <h1 className='title'>{auction.title}</h1>
        <p>{auction.description}</p>
        <p>Sold by <Link href='/users/[id]/[slug]' as={`/users/${auction.seller.id}/${auction.seller.username}`} style={{ fontWeight: 'bold' }}>{auction.seller.username}</Link></p>
        <hr />
      </div>
      <div className='column is-half container box'>
      <h2 className='title'>Bids</h2>
        {/* Feel free to rework or move this: */}
        <div className="notification is-dark level">
          <div className="level-item">Auction Ends:&nbsp;<strong>{new Date(auction.endsAt as Date).toLocaleDateString()}</strong></div>
          <div className="level-item">High Bid:&nbsp;<strong>${String(data?.max ?? 0)}</strong></div>
          <div className="level-item"><strong>{data?.bids.length ?? 0}</strong>&nbsp;Bids</div>
        </div>
        <div className='rows'>
          <div className='row'>
            <ul className='list'>
              {(data?.bids ?? []).map(bid => (
                <BidItem bid={bid} key={bid.id} />
              ))}
            </ul>
          </div>
          <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
          <div className='container box-link-hover-shadow'>
            <button className='button is-primary button is-normal is-fullwidth' onClick={() => setBidding(true)}>Bid</button>
          </div>
        </div>
      </div>
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
      <p>
        <Link {...linkProps} className='has-text-dark has-text-weight-bold'>{bid.user.username}</Link> <small>{new Date(bid.date).toLocaleDateString()}</small>
        <br />
        Bid {formatter.format(bid.amount)}
      </p>
    </div>
  </div>
</article>)
}
