import { Report } from '@prisma/client'
import prisma from 'api-lib/common/prisma'
import request from 'lib/request'
import Link from 'next/link'
import Router from 'next/router'
import { useState } from 'react'
import AdminLayout from './_layout'

interface UserInfo { id: number, username: string }
interface AuctionInfo { id: number, title: string, slug: string, seller: UserInfo }
type FullReport = Report & { customer: UserInfo, auction: AuctionInfo }

export default function ReportsAdminPage ({ reports }: { reports: FullReport[] }) {
  return (
    <AdminLayout>
        <table className="table is-fullwidth">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Subject</th>
                    <th>Reported by</th>
                    <th>Message</th>
                    <th>Resolved</th>
                </tr>
            </thead>
            <tbody>
                {reports.map(report => (
                    <tr key={report.id}>
                        <td>{report.id}</td>
                        <td><Link href='/auctions/[id]/[slug]' as={`/auctions/${report.auction.id}/${report.auction.slug}`}>{report.auction.title}<br /><small>(Sold by {report.auction.seller.username})</small></Link></td>
                        <td>
                          {report.customer != null && (
                            <Link href='/users/[id]/[username]' as={`/users/${report.customer.id}/${report.customer.username}`}>{report.customer.username}</Link>
                          )}
                          {report.customerName != null && report.customerName}
                        </td>
                        <td>{report.message}</td>
                        <td><SelectReportStatus report={report} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </AdminLayout>
  )
}

function SelectReportStatus ({ report }: { report: Report }) {
  const [value, setValue] = useState(report.isResolved)
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)

    const body: Partial<Report> = { isResolved: value }

    request({
      method: 'PATCH',
      url: `/api/reports/${report.id}`,
      body
    })
      .then(async () => await Router.replace(Router.asPath))
      .catch(err => alert(err))
      .finally(() => setLoading(false))
  }

  const saveButton = <button className={`button is-small ${loading ? 'is-loading' : ''}`} onClick={handleSave}>Save</button>

  return (
    <>
        <label htmlFor='is-resolved' className="checkbox">
            <input type="checkbox" name="is-resolved" checked={value} onChange={e => setValue(e.target.checked)} />
            Resolved
        </label>
        {value !== report.isResolved ? saveButton : <></>}
    </>
  )
}

export async function getServerSideProps () {
  const reports = await prisma.report.findMany({
    include: {
      customer: {
        select: { id: true, username: true }
      },
      auction: {
        select: {
          id: true,
          title: true,
          slug: true,
          seller: {
            select: { id: true, username: true }
          }
        }
      }
    }
  })
  return { props: { reports } }
}
