import { Auction } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { auctionURL } from '../lib/url'

export default function AuctionItem ({ auction }: { auction: Auction }) {
  return (
    <article className='media'>
        <figure className='media-left'>
            <Link href={auctionURL(auction)}>
                <p className='image is-128x128'>
                    <Image src={auction.image} alt={auction.title} width={128} height={128} />
                </p>
            </Link>
        </figure>
        <div className='media-content'>
            <Link href={auctionURL(auction)}>
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
