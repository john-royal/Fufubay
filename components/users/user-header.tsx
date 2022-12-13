import Image from 'next/image'
import { ReactNode } from 'react'
import { makeImageUrl } from '../../lib/images'

export interface Props {
  username: string
  imageUrl: string
  bio: string | null
  createdAt: Date
  rating: number | null
  children?: ReactNode
}

export default function UserHeader ({ username, imageUrl, bio, createdAt, rating, children }: Props) {
  const joinMonthYear = createdAt.toLocaleDateString('en-us', { month: 'long', year: 'numeric' })

  return (
    <header>
        <div className='level'>
            <div className='level-left m-5'>
                <div className='level-item'>
                    <figure className='image is-128x128'>
                    <Image src={imageUrl} alt={username} className='is-rounded' width={128} height={128} priority loader={makeImageUrl} />
                    </figure>
                </div>
                <div className='level-item'>
                    <div className='has-text-centered-mobile'>
                        <h1 className='title has-text-weight-bold mb-5'>{username}</h1>
                        <p className='subtitle is-6 has-text-grey'>Joined {joinMonthYear}</p>
                        <p className='subtitle is-6 has-text-grey'>{rating != null ? `Rating: ${rating}` : ''}</p>
                    </div>
                </div>
            </div>
            {children != null
              ? (<>
                <div className='level-right'>
                    <div className='level-item'>
                        {children}
                    </div>
                </div>
            </>)
              : (<></>)}
        </div>
        {bio != null ? <p>{bio}</p> : <></>}
    </header>
  )
}
