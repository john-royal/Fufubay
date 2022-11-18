import { Auction, User } from '@prisma/client'
import Router from 'next/router'
import useForm from '../../lib/form'
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import getUser from '../../lib/user'

export function getServerSideProps ({ req }: GetServerSidePropsContext): GetServerSidePropsResult<{ user: User }> {
  const user = getUser(req.cookies.token)
  if (user != null) {
    return { props: { user } }
  } else {
    return { redirect: { destination: '/auth/sign-in', permanent: false } }
  }
}

export default function CreateAuctionPage () {
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
