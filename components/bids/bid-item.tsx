import { Bid, BidStatus, User } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { makeImageUrl } from '../../lib/images'

type UserBid = Bid & { user: User }

export function BidItem ({ bid, children }: { bid: UserBid, children?: ReactNode }) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  })
  const linkProps = {
    href: '/users/[id]/[slug]',
    as: `/users/${bid.user.id}/${bid.user.username}`
  }

  return (
    <article className='media'>
        <figure className='media-left'>
            <p className='image is-64x64'>
                <Link {...linkProps}>
                    <Image src={bid.user.imageUrl} alt={bid.user.username} width={64} height={64} className='is-rounded' loader={makeImageUrl} />
                </Link>
            </p>
        </figure>
        <div className='media-content'>
            <div className='content'>
                <p className='mb-1'>
                    <Link {...linkProps} className='has-text-dark has-text-weight-bold'>{bid.user.username}</Link> <small>{new Date(bid.date).toLocaleDateString()}</small>
                </p>
                <div className='tags are-medium'>
                  <span className='tag is-dark'>
                      <span className='has-text-grey'>Bid&nbsp;</span>
                      <strong className='has-text-white'>{formatter.format(bid.amount)}</strong>
                  </span>
                  {bid.status === BidStatus.WIN
                    ? (
                    <span className='tag is-primary'>Winner</span>
                      )
                    : <></>}
                </div>
            </div>
        </div>
        {children != null ? <div className='media-right'>{children}</div> : <></>}
    </article>
  )
}
