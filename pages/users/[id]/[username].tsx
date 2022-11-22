import { Auction, User } from '@prisma/client'
import { GetServerSidePropsResult } from 'next'
import AuctionItem from '../../../components/auction-item'
import UserHeader from '../../../components/user-header'
import { get } from '../../../lib/request'

export async function getServerSideProps ({ params: { id, username } }: { params: { id: string, username: string } }): Promise<GetServerSidePropsResult<{ user: User, auctions: Auction[] }>> {
  const responses = await Promise.all([
    get<User>(`/api/users/${id}`),
    get<Auction[]>(`/api/auctions?sellerID=${id}`)
  ])
  if (!responses[0].success || !responses[1].success) {
    return {
      notFound: true
    }
  }
  const [{ data: user }, { data: auctions }] = responses
  if (username !== user.username) {
    return {
      redirect: {
        destination: `/users/${user.id}/${user.username}`,
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
        <UserHeader {...user} />
        <hr />
        <section>
          <h2 className='title'>Auctions</h2>
          {auctions.map(auction =>
            <AuctionItem key={auction.id} auction={auction} />
          )}
        </section>
      </div>
  )
}
