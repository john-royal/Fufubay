import { Auction, User } from '@prisma/client'
import { GetServerSidePropsResult } from 'next'
import Image from 'next/image'
import AuctionItem from '../../../components/auction-item'
import { get } from '../../../lib/request'
import { userURL } from '../../../lib/url'

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
        destination: userURL(user),
        permanent: true
      }
    }
  }
  return {
    props: { user, auctions }
  }
}

function UserHeader ({ username, image, bio, createdAt }: User) {
  const joinMonthYear = new Date(createdAt).toLocaleDateString('en-us', { month: 'long', year: 'numeric' })

  return (
    <header>
      <div className='level'>
        <div className='level-left'>
          <div className='level-item'>
            <figure className='image is-128x128'>
              <Image src={image} alt={username} className='is-rounded' width={128} height={128} />
            </figure>
          </div>
        </div>
        <div className='level-item'>
          <div className='ml-5 mr-auto'>
            <h1 className='title has-text-weight-bold mb-3'>{username}</h1>
            <p className='heading has-text-grey'>Member Since {joinMonthYear}</p>
          </div>
        </div>
      </div>
      {bio !== '' ? <p>{bio}</p> : <></>}
    </header>
  )
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
