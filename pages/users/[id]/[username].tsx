import { Auction, User } from '@prisma/client'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import Image from 'next/image'
import AuctionItem from '../../../components/auction-item'
import { get } from '../../../lib/request'
import { userURL } from '../../../lib/url'

export async function getServerSideProps ({ params, req }: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{ user: User, auctions: Auction[] }>> {
  if (typeof params?.id !== 'string' || typeof params?.username !== 'string') {
    return { notFound: true }
  }
  const [userResponse, auctionsResponse] = await Promise.all([
    get<User>(`/api/users/${params.id}`),
    get<Auction[]>(`/api/auctions?sellerID=${params.id}`)
  ])
  if (!userResponse.success) {
    return { notFound: true }
  }
  const user = userResponse.data
  const auctions = auctionsResponse.success ? auctionsResponse.data : []
  if (user.username !== params.username) {
    return {
      redirect: {
        destination: userURL(user),
        permanent: true
      }
    }
  }
  return {
    props: { user, auctions }
  }
}

export default function UserPage ({ user, auctions }: { user: User, auctions: Auction[] }) {
  return (
      <div className='container mt-5'>
        <section className='columns'>
          <div className='column is-one-quarter'>
            <Image src={user.image} alt={user.username} width={200} height={200} />
          </div>
          <div className='column is-three-quarters'>
            <h1 className='title'>{user.username}</h1>
            <p>{user.bio === '' ? 'This user has not added a bio yet.' : user.bio}</p>
          </div>
        </section>
        <section>
          <h2 className='title'>Auctions</h2>
          {auctions.map(auction =>
            <AuctionItem key={auction.id} auction={auction} />
          )}
        </section>
      </div>
  )
}
