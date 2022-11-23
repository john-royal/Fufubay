import { Auction } from '@prisma/client'
import { withIronSessionSsr } from 'iron-session/next'
import Router from 'next/router'
import { Button, Form, TextField } from '../../components/form'
import useForm from '../../lib/form'
import useUser from '../../lib/user'
import { sessionOptions } from '../../shared/session'

export default function CreateAuctionPage () {
  useUser()
  const { register, submit } = useForm<Auction>({
    method: 'POST',
    url: '/api/auctions'
  }, {
    title: '',
    description: ''
  }, async auction => {
    await Router.push(`/auctions/${auction.id}/${auction.slug}`)
  })

  return (
    <div className="container mt-5">
      <h1 className='title'>New Auction</h1>

      <Form onSubmit={submit}>
        <TextField title='Title' type='text' {...register('title')} />
        <TextField title='Description' type='text' {...register('description')} />
        <Button title='Create' />
      </Form>
    </div>
  )
}
export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  if (req.session.user == null) {
    return {
      redirect: { destination: '/?redirect=/auctions/create', permanent: false }
    }
  } else {
    return { props: {} }
  }
}, sessionOptions)
