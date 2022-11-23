import { User } from '@prisma/client'
import Image from 'next/image'
import { ReactNode } from 'react'

export interface Props extends User {
  children?: ReactNode
}

export default function UserHeader ({ username, image, bio, createdAt, children }: Props) {
  const joinMonthYear = new Date(createdAt).toLocaleDateString('en-us', { month: 'long', year: 'numeric' })

  return (
    <header className='m-5'>
        <div className='level'>
            <div className='level-left'>
                <div className='level-item'>
                    <figure className='image is-128x128'>
                    <Image src={image} alt={username} className='is-rounded' width={128} height={128} />
                    </figure>
                </div>
            </div>
            <div className='level-item'>
                <div className='ml-5 mr-auto'>
                    <h1 className='title has-text-weight-bold mb-5'>{username}</h1>
                    <p className='subtitle is-6 has-text-grey'>Joined {joinMonthYear}</p>
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
        {bio !== '' ? <p>{bio}</p> : <></>}
    </header>
  )
}
