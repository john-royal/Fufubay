import { Auction } from '@prisma/client'
import Link from 'next/link'
import { PropsWithChildren } from 'react'

export default function AuctionLink ({ auction, children }: { auction: Pick<Auction, 'id' | 'slug'> } & PropsWithChildren) {
  const linkProps = {
    href: '/auctions/[id]/[slug]',
    as: `/auctions/${auction.id}/${auction.slug}`
  }
  return (
    <Link {...linkProps}>
        {children}
    </Link>
  )
}
