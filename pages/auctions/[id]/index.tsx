import { Auction, User } from '@prisma/client'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import Link from 'next/link'
import { get } from '../../../lib/request'

interface AuctionWithSeller extends Auction {
  seller: User
}

export async function getServerSideProps ({ params, req }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{ auction: AuctionWithSeller }>> {
  if (params?.id == null || Array.isArray(params.id)) {
    return { notFound: true }
  }
  const res = await get<AuctionWithSeller>(`/api/auctions/${params.id}`)
  if (!res.success) {
    return { notFound: true }
  }
  return {
    props: { auction: res.data }
  }
}

export default function AuctionPage ({ auction }: { auction: AuctionWithSeller }) {
  return (
    <div className='container mt-5'>
      <h1 className='title'>{auction.title}</h1>
        <p>{auction.description}</p>
        <p>Sold by <Link href={`/users/${auction.sellerId}`} style={{ fontWeight: 'bold' }}>{auction.seller.email}</Link></p>
        <pre>{JSON.stringify(auction, null, 2)}</pre>
    </div>
  )
}
