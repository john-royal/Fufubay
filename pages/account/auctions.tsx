import { Auction, AuctionStatus } from '@prisma/client'
import { withIronSessionSsr } from 'iron-session/next'
import Link from 'next/link'
import { sessionOptions } from '../../common/session'
import AuctionRow from '../../components/auctions/auction-row'
import request from '../../lib/request'
import AccountLayout from './_layout'

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  const id = req.session.user?.id as number
  const auctions = await request({
    method: 'GET',
    url: `http://localhost:8080/api/auctions?sellerId=${id}&status=${Object.values(AuctionStatus).join(',')}`
  })
  return { props: { auctions } }
}, sessionOptions)

export default function Listings ({ auctions }: { auctions: Auction[] }) {
  return (
    <AccountLayout>
        <h1 className="title has-text-weight-bold">My Auctions</h1>
        <hr />
        {auctions.length > 0
          ? auctions.map(auction => <AuctionRow key={auction.id} auction={auction} />)
          : <EmptyState />}
    </AccountLayout>
  )
}

function EmptyState () {
  return (
    <>
        <p>You haven’t listed any items yet. Want to sell with Fufubay?</p>
        <Link href='/sell' className='button is-link mt-5'>Get Started</Link>
    </>
  )
}
