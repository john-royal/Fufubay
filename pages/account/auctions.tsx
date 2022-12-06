import { Auction } from '@prisma/client'
import { withIronSessionSsr } from 'iron-session/next'
import Link from 'next/link'
import { sessionOptions } from '../../common/session'
import AuctionRow from '../../components/auctions/auction-row'
import prisma from '../../lib/prisma'
import AccountLayout from './_layout'

export default function Auctions ({ auctions }: { auctions: Auction[] }) {
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

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  const auctions = await prisma.auction.findMany({
    where: {
      sellerId: req.session.user?.id as number
    },
    orderBy: { createdAt: 'desc' }
  })
  return { props: { auctions } }
}, sessionOptions)
