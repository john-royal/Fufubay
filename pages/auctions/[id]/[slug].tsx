import { Auction, User } from '@prisma/client'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { get } from '../../../lib/request'
import { auctionURL, userURL } from '../../../lib/url'

interface AuctionWithSeller extends Auction {
  seller: User
}

export async function getServerSideProps ({ params, req }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{ auction: AuctionWithSeller }>> {
  if (typeof params?.id !== 'string' || typeof params?.slug !== 'string') {
    return { notFound: true }
  }
  const res = await get<AuctionWithSeller>(`/api/auctions/${params.id}`)
  if (!res.success) {
    return { notFound: true }
  }
  const auction = res.data
  if (auction.slug !== params.slug) {
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
