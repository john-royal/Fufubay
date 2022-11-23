import { Auction, Bid, User } from '@prisma/client'
import { GetServerSidePropsResult } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import request from '../../../lib/request'
import BidModal from './_bid'

interface SellerAuction extends Auction {
  seller: User
}

interface UserBid extends Bid {
  user: User
}

export async function getServerSideProps ({ params: { id, slug } }: { params: { id: string, slug: string } }): Promise<GetServerSidePropsResult<{ auction: SellerAuction, bids: UserBid[] }>> {
  const [auction, bids] = await Promise.all([
    request<SellerAuction>({ method: 'GET', url: `http://localhost:8080/api/auctions/${id}` }),
    request<UserBid[]>({ method: 'GET', url: `http://localhost:8080/api/bids?auctionID=${id}&include=user` })
  ])
  if (slug !== auction.slug) {
    return {
      redirect: {
        destination: `/auctions/${auction.id}/${auction.slug}`,
        permanent: true
      }
    }
  }
  return {
    props: { auction, bids }
  }
}

export default function AuctionPage ({ auction, bids }: { auction: SellerAuction, bids: UserBid[] }) {
  const [active, setActive] = useState(false)

  return (
    <div className='container mt-5 columns level is-centered is-variable is-1-mobile is-0-tablet is-3-desktop is-8-widescreen is-2-fullhd'>
      <div className='column is-one-fifth'></div>
      <div className='column is-half'>
      <Image src={auction.image} alt={auction.title} width={680} height={540} />
      <h1 className='title'>{auction.title}</h1>
      <p>{auction.description}</p>
      <p>Sold by <Link href='/users/[id]/[slug]' as={`/users/${auction.seller.id}/${auction.seller.username}`} style={{ fontWeight: 'bold' }}>{auction.seller.username}</Link></p>
      <hr />
      </div>
      <div className='column is-half container box'>
      <h2 className='title'>Bid Information</h2>
      <div className='rows'>
        <div className='row'>
      <ul className='list'>
        {bids.map(bid => (
          <BidItem bid={bid} key={bid.id} />
        ))}
      </ul>
      </div>
      <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/> <br/>
      <div className='container box-link-hover-shadow'>
      <br/>
      <button className='button is-primary button is-normal is-fullwidth' onClick={() => setActive(true)}>Bid</button>
      <BidModal isActive={active} handleClose={() => setActive(false)} auctionID={auction.id} />
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

    // These options are needed to round to whole numbers if that's what you want.
    // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    // maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  })

  return (<article className='media'>
  <figure className='media-left'>
    <p className='image is-64x64'>
      <Image src={bid.user.image} alt={bid.user.username} width={64} height={64} className='is-rounded' />
    </p>
  </figure>
  <div className='media-content'>
    <div className='content'>
      <p>
        <strong>{bid.user.username}</strong> <small>{new Date(bid.date).toLocaleDateString()}</small>
        <br />
        Bid {formatter.format(bid.amount)}
      </p>
    </div>
  </div>
</article>)
}
