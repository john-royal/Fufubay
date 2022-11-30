import { Auction } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { makeImageUrl } from '../../lib/images'

export default function AuctionItem ({ auction }: { auction: Auction }) {
  const linkProps = {
    href: '/auctions/[id]/[slug]',
    as: `/auctions/${auction.id}/${auction.slug}`
  }
  return (
    <article className='media'>
        <figure className='media-left'>
            <Link {...linkProps}>
                <p className='image is-128x128'>
                    <Image src={auction.imageUrl} alt={auction.title} width={128} height={128} loader={makeImageUrl} />
                </p>
            </Link>
        </figure>
        <div className='media-content'>
            <Link {...linkProps}>
                <div className='content'>
                    <strong>{auction.title}</strong>
                    <br />
                    {auction.description}
                </div>
            </Link>
        </div>
    </article>
  )
}