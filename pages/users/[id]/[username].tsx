import { Auction, Bid, User } from '@prisma/client'
import { GetServerSidePropsResult } from 'next'
import AuctionRow from '../../../components/auctions/auction-row'
import UserHeader from '../../../components/users/user-header'
import prisma from '../../../lib/prisma'

type UserProfile = Pick<User, 'username' | 'bio' | 'imageUrl' | 'createdAt'> & { auctions: Auction[], bids: Bid[] }

export default function UserPage ({ user }: { user: UserProfile }) {
  return (
      <div className='container mt-5'>
        <UserHeader username={user.username} bio={user.bio} imageUrl={user.imageUrl} createdAt={user.createdAt} />
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

export async function getServerSideProps ({ params: { id, username } }: { params: { id: string, username: string } }): Promise<GetServerSidePropsResult<{ user: UserProfile }>> {
  const user = await prisma.user.findUniqueOrThrow({
    select: {
      id: true,
      username: true,
      bio: true,
      imageUrl: true,
      createdAt: true,
      auctions: true,
      bids: { include: { auction: true } }
    },
    where: { id: Number(id) }
  })
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
