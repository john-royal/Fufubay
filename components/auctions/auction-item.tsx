import { Auction } from '@prisma/client'
import Image from 'next/image'
import { makeImageUrl } from '../../lib/images'
import AuctionLink from './auction-link'

export default function AuctionItem ({ auction }: { auction: Auction }) {
  return (
    <AuctionLink auction={auction}>
        <article className='tile is-child'>
            <figure className="image mb-3">
                <Image src={auction.imageUrl} alt={auction.title} width={320} height={240} style={{ width: '320px', height: '240px' }} loader={makeImageUrl} />
            </figure>
            <p className="title has-text-weight-bold is-6 mb-1">{auction.title}</p>
            <p className="is-size-7 has-text-dark">{auction.description}</p>
            <p className="is-size-7 has-text-grey">Ends {new Date(auction.endsAt ?? 0).toLocaleDateString()}</p>
        </article>
    </AuctionLink>
  )
}
