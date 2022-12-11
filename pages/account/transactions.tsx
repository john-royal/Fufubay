import { Auction, Bid, BidStatus } from '@prisma/client'
import prisma from 'api-lib/common/prisma'
import AuctionRow from 'components/auctions/auction-row'
import ReviewModal from 'components/review'
import { withIronSessionSsr } from 'iron-session/next'
import { useState } from 'react'
import { sessionOptions } from 'session.config'
import AccountLayout from './_layout'

type AuctionBid = Bid & { auction: Auction }
interface TransactionsProps { bids: AuctionBid[] }

export default function TransactionsPage ({ bids }: TransactionsProps) {
  const [reviewing, setReviewing] = useState<Auction['sellerId'] | null>(null)

  return (
    <AccountLayout>
        <ReviewModal sellerId={reviewing as Auction['sellerId']} isActive={reviewing != null} handleClose={() => setReviewing(null)} />

        <h1 className='title has-text-weight-bold'>Transactions</h1>

        {bids.map(bid =>
            <AuctionRow key={bid.id} auction={bid.auction}>
                {bid.status === BidStatus.WIN
                  ? (
                    <div className='tags are-medium'>
                        <span className='tag is-dark'>
                            <span className='has-text-grey'>Bid&nbsp;</span>
                            <strong className='has-text-white'>${bid.amount}</strong>
                        </span>
                        <span className='tag is-primary'>Winner</span>
                        <button className='button tag' onClick={() => setReviewing(bid.auction.sellerId)}>Review Seller</button>
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
    </AccountLayout>
  )
}

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  const bids = await prisma.bid.findMany({
    include: {
      auction: true
    },
    where: {
      userId: req.session.user?.id as number
    },
    orderBy: {
      date: 'desc'
    }
  })
  return { props: { bids } }
}, sessionOptions)
