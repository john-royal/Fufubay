import { Auction, AuctionStatus, User } from '@prisma/client'
import { GetServerSidePropsResult } from 'next'
import AuctionRow from '../../../components/auctions/auction-row'
import UserHeader from '../../../components/users/user-header'
import { get } from '../../../lib/request'

export async function getServerSideProps ({ params: { id, username } }: { params: { id: string, username: string } }): Promise<GetServerSidePropsResult<{ user: User, auctions: Auction[] }>> {
  const responses = await Promise.all([
    get<User>(`http://localhost:8080/api/users/${id}`),
    get<Auction[]>(`http://localhost:8080/api/auctions?sellerId=${id}&status=${Object.values(AuctionStatus).join(',')}`)
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
            <AuctionRow key={auction.id} auction={auction} />
          )}
        </section>
      </div>
  )
}
