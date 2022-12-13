import { Auction, AuctionStatus, Bid, BidStatus, User } from '@prisma/client'
import { getUser } from 'api-lib/users'
import AuctionRow from 'components/auctions/auction-row'
import UserHeader from 'components/users/user-header'
import { GetServerSidePropsResult } from 'next'

type UserProfile = Pick<User, 'id' | 'username' | 'bio' | 'imageUrl' | 'createdAt'> & { auctions: Auction[], bids: Array<Bid & { auction: Auction }>, rating: number | null }

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
        {user.bids.map(bid =>
            <AuctionRow key={bid.id} auction={bid.auction}>
                {bid.status === BidStatus.WIN
                  ? (
                    <div className='tags are-medium'>
                        <span className='tag is-dark'>
                            <span className='has-text-grey'>Bid&nbsp;</span>
                            <strong className='has-text-white'>${bid.amount}</strong>
                        </span>
                        <span className='tag is-primary'>Winner</span>
                    </div>
                    )
                  : (
                    <span className='tag is-medium is-dark'>
                        <span className='has-text-grey'>Bid&nbsp;</span>
                        <strong className='has-text-white'>${bid.amount}</strong>
                    </span>
                    )}
            </AuctionRow>
        )}
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
    auctions: { where: { status: { notIn: [AuctionStatus.CANCELED, AuctionStatus.PENDING_REVIEW] } } },
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
