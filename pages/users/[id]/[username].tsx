import { Auction, Bid, User } from '@prisma/client'
import { getUser } from 'api-lib/users'
import AuctionRow from 'components/auctions/auction-row'
import UserHeader from 'components/users/user-header'
import { GetServerSidePropsResult } from 'next'

type UserProfile = Pick<User, 'id' | 'username' | 'bio' | 'imageUrl' | 'createdAt'> & { auctions: Auction[], bids: Bid[], rating: number | null }

export default function UserPage ({ user }: { user: UserProfile }) {
  return (
      <div className='container mt-5'>
        <UserHeader username={user.username} bio={user.bio} imageUrl={user.imageUrl} rating={user.rating} createdAt={user.createdAt} />
        <hr />
        <section>
          <h2 className='title'>Auctions</h2>
          {user.auctions.map(auction =>
            <AuctionRow key={auction.id} auction={auction} />
          )}
        </section>
        <hr />
        <section>
          <h2 className='title'>Bids</h2>
          <pre>
            {JSON.stringify(user.bids, null, 2)}
          </pre>
        </section>
      </div>
  )
}

export async function getServerSideProps ({ params: { id, username } }: { params: { id: number, username: string } }): Promise<GetServerSidePropsResult<{ user: UserProfile }>> {
  const user = await getUser(Number(id), {
    id: true,
    username: true,
    bio: true,
    imageUrl: true,
    createdAt: true,
    auctions: true,
    bids: { include: { auction: true } },
    rating: true
  }) as unknown as UserProfile
  if (username !== user.username) {
    return {
      redirect: {
        destination: `/users/${user.id}/${user.username}`,
        permanent: true
      }
    }
  }
  return {
    props: { user }
  }
}
