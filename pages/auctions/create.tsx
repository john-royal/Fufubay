import { Auction } from '@prisma/client'
import Router from 'next/router'
import useForm from '../../lib/form'
import { useAuthenticatedUser } from '../../lib/user'

export default function CreateAuctionPage () {
  useAuthenticatedUser() // redirect to sign in page if not authenticated
  const { error, register, submit } = useForm<Auction>('/api/auctions', {
    title: '',
    description: ''
  }, async result => {
    await Router.push(`/auctions/${result.id}`)
  })

  return (
    <>
    <h1>New Auction</h1>

    {error != null ? '' : <p>Error: {error}</p>}

    <form onSubmit={submit}>
        <label htmlFor="title">Title</label>
        <input type="text" {...register('title')} required />
        <label htmlFor="description">Description</label>
        <input type="text" {...register('description')} required />
        <button type="submit">Create Auction</button>
    </form>
    </>
  )
}
