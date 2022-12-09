import { AuctionStatus, UserRole } from '@prisma/client'
import prisma from 'api-lib/common/prisma'
import AdminLayout from './_layout'

export default function AdminPage ({ auctions, users, reports }: { auctions: number, users: number, reports: number }) {
  return (
    <AdminLayout>
      <p>There are {auctions} auctions, {users} users, and {reports} reports pending review.</p>
    </AdminLayout>
  )
}

export async function getServerSideProps () {
  const [auctions, users, reports] = await Promise.all([
    prisma.auction.count({
      where: { status: AuctionStatus.PENDING_REVIEW }
    }),
    prisma.user.count({
      where: { role: UserRole.PENDING_REVIEW }
    }),
    prisma.report.count({
      where: { isResolved: false }
    })
  ])
  return { props: { auctions, users, reports } }
}
