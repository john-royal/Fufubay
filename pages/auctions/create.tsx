import { Auction } from '@prisma/client'
import Router from 'next/router'
import { useEffect } from 'react'
import useForm from '../../lib/form'
import { auctionURL } from '../../lib/url'
import useUser from '../../lib/user'

export default function CreateAuctionPage () {
  const [user] = useUser()

  useEffect(() => {
    if (user == null) void Router.replace('/auth/sign-in?redirect=/auctions/create')
  })

  const { error, register, submit, working } = useForm<Auction>('/api/auctions', {
    title: '',
    description: ''
  }, async auction => {
    await Router.push(auctionURL(auction))
  })

  return (
    <div className="container mt-5">
      <h1 className='title'>New Auction</h1>

      <div className='form'>
        <div className={'notification is-danger' + (error === '' ? ' is-hidden' : '')}><strong>{error}</strong> Please try again.</div>
        <form onSubmit={submit}>
          <div className='field'>
            <label htmlFor='title' className='label'>Title</label>
            <div className='control'>
              <input type='text' {...register('title')} className='input' placeholder='Title' required />
            </div>
          </div>
          <div className='field'>
            <label htmlFor='description' className='label'>Description</label>
            <div className='control'>
                <input type='text' {...register('description')} className='input' placeholder='Description' required />
            </div>
          </div>
          <div className='field'>
            <div className='control'>
              <button className={`button is-primary is-fullwidth ${working ? 'is-working' : ''}`}>Create Auction</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
