import { Auction, AuctionStatus, User, UserRole } from '@prisma/client'
import { useState } from 'react'
import AuctionRow from '../components/auctions/auction-row'
import prisma from '../lib/prisma'
import request from '../lib/request'

export default function AdminPage ({ auctions, users }: { auctions: Auction[], users: User[] }) {
  const [loading, setLoading] = useState(false)

  const updateAuction = (auction: Auction, status: AuctionStatus) => {
    setLoading(true)

    const body: Partial<Auction> = { status }

    if (status === AuctionStatus.LIVE) {
      const MILLISECONDS_IN_A_WEEK = 7 * 24 * 60 * 60 * 1000
      body.startsAt = new Date()
      body.endsAt = new Date(Date.now() + MILLISECONDS_IN_A_WEEK)
    }

    request({
      method: 'PATCH',
      url: `/api/auctions/${auction.id}`,
      body
    })
      .catch(err => alert(err))
      .finally(() => setLoading(false))
  }

  const updateUser = (user: User, role: UserRole) => {
    setLoading(true)

    const body: Partial<User> = { role }

    request({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body
    })
      .catch(err => alert(err))
      .finally(() => setLoading(false))
  }

  return (
    <div className="container p-5">
      <h1 className="title">Administrator</h1>
      <hr />
      <h2 className="title is-4">Auctions Pending Review</h2>
      {auctions.map(auction => <AuctionRow key={auction.id} auction={auction}>
        <div>
          <button
            className={`button is-small is-fullwidth is-success mb-1 ${loading ? 'is-loading' : ''}`}
            onClick={() => updateAuction(auction, AuctionStatus.LIVE)}
          >
            Accept
          </button>
          <button
            className={`button is-small is-fullwidth is-danger ${loading ? 'is-loading' : ''}`}
            onClick={() => updateAuction(auction, AuctionStatus.CANCELED)}
          >
            Deny
          </button>
        </div>
      </AuctionRow>)}
      <hr />
      <h2 className="title is-4">Users Pending Review</h2>
      {users.map(user => (
        <div className='media' key={user.id}>
          <div className="media-left">
            <div>
              {user.username}
              {user.email}
              {user.createdAt.toLocaleDateString()}
            </div>
          </div>
          <div className="media-right">
            <div>
              <button
                className={`button is-small is-fullwidth is-success mb-1 ${loading ? 'is-loading' : ''}`}
                onClick={() => updateUser(user, UserRole.ORDINARY_USER)}
              >
                Accept
              </button>
              <button
                className={`button is-small is-fullwidth is-danger ${loading ? 'is-loading' : ''}`}
                onClick={() => updateUser(user, UserRole.PENDING_REVIEW)}
              >
                Deny
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export async function getServerSideProps () {
  const [auctions, users] = await Promise.all([
    prisma.auction.findMany({
      where: { status: AuctionStatus.PENDING_REVIEW },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.user.findMany({
      where: { role: UserRole.PENDING_REVIEW },
      orderBy: { createdAt: 'asc' }
    })
  ])
  return { props: { auctions, users } }
}
