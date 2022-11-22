import { Auction, User } from '@prisma/client'
import { GetServerSidePropsResult } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { get } from '../../../lib/request'
import { auctionURL, userURL } from '../../../lib/url'

interface AuctionWithSeller extends Auction {
  seller: User
}

export async function getServerSideProps ({ params: { id, slug } }: { params: { id: string, slug: string } }): Promise<GetServerSidePropsResult<{ auction: AuctionWithSeller }>> {
  const response = await get<AuctionWithSeller>(`/api/auctions/${id}`)
  if (!response.success) {
    return { notFound: true }
  }
  const auction = response.data
  if (slug !== auction.slug) {
    return {
      redirect: {
        destination: auctionURL(auction),
        permanent: true
      }
    }
  }
  return {
    props: { auction }
  }
}

export default function AuctionPage ({ auction }: { auction: AuctionWithSeller }) {
  return (
    <div className='container mt-5'>
      <Image src={auction.image} alt={auction.title} width={680} height={540} />
      <h1 className='title'>{auction.title}</h1>
        <p>{auction.description}</p>
        <p>Sold by <Link href={userURL(auction.seller)} style={{ fontWeight: 'bold' }}>{auction.seller.username}</Link></p>
    </div>
  )
}