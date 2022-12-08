import { AuctionStatus, UserRole } from '@prisma/client'
import prisma from 'api-lib/common/prisma'
import AdminLayout from './_layout'

export default function AdminPage ({ auctions, users }: { auctions: number, users: number }) {
  return (
    <AdminLayout>
      <p>There are {auctions} auctions and {users} users pending review.</p>
    </AdminLayout>
  )
}

export async function getServerSideProps () {
  const [auctions, users] = await Promise.all([
    prisma.auction.count({
      where: { status: AuctionStatus.PENDING_REVIEW }
    }),
    prisma.user.count({
      where: { role: UserRole.PENDING_REVIEW }
    })
  ])
  return { props: { auctions, users } }
}
