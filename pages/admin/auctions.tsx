import { Auction, AuctionStatus, User } from '@prisma/client'
import prisma from 'api-lib/common/prisma'
import request from 'lib/request'
import Link from 'next/link'
import Router from 'next/router'
import { useState } from 'react'
import AdminLayout from './_layout'

type SellerAuction = Auction & { seller: User }

export default function AuctionsAdminPage ({ auctions }: { auctions: SellerAuction[] }) {
  return (
    <AdminLayout>
        <table className="table is-fullwidth">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Seller</th>
                    <th>Starts At</th>
                    <th>Ends At</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {auctions.map(auction => (
                    <tr key={auction.id}>
                        <td>{auction.id}</td>
                        <td><Link href='/auctions/[id]/[slug]' as={`/auctions/${auction.id}/${auction.slug}`}>{auction.title}</Link></td>
                        <td><Link href='/users/[id]/[username]' as={`/users/${auction.seller.id}/${auction.seller.username}`}>{auction.seller.username}</Link></td>
                        <td>{auction.startsAt?.toLocaleDateString()}</td>
                        <td>{auction.endsAt?.toLocaleDateString()}</td>
                        <td><SelectAuctionStatus auction={auction} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </AdminLayout>
  )
}

function SelectAuctionStatus ({ auction }: { auction: Auction }) {
  const [value, setValue] = useState(auction.status)
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)

    const body: Partial<Auction> = { status: value }

    if (value === AuctionStatus.LIVE) {
      const MILLISECONDS_IN_A_WEEK = 7 * 24 * 60 * 60 * 1000
      body.startsAt = new Date()
      body.endsAt = new Date(Date.now() + MILLISECONDS_IN_A_WEEK)
    }

    request({
      method: 'PUT',
      url: `/api/auctions/${auction.id}/status`,
      body
    })
      .then(async () => await Router.replace(Router.asPath))
      .catch(err => alert(err))
      .finally(() => setLoading(false))
  }

  const saveButton = <button className={`button is-small ${loading ? 'is-loading' : ''}`} onClick={handleSave}>Save</button>

  return (
    <>
        <div className="select is-small">
            <select value={value} onChange={e => setValue(e.target.value as AuctionStatus)}>
                {Object.values(AuctionStatus).map(role => (
                        <option key={role} value={role}>{role}</option>
                ))}
            </select>
        </div>
        {value !== auction.status ? saveButton : <></>}
    </>
  )
}

export async function getServerSideProps () {
  const auctions = await prisma.auction.findMany({
    include: { seller: true },
    orderBy: { createdAt: 'desc' }
  })
  return { props: { auctions } }
}
