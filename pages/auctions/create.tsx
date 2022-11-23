import { Auction } from '@prisma/client'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import AuthModal, { Screen } from '../../components/auth'
import { Button, Form, TextField } from '../../components/form'
import useForm from '../../lib/form'
import useUser from '../../lib/user'

export default function CreateAuctionPage () {
  const [user] = useUser()
  const [modal, setModal] = useState<Screen>(null)
  const { register, submit } = useForm<Auction>({
    method: 'POST',
    url: '/api/auctions'
  }, {
    title: '',
    description: ''
  }, async auction => {
    await Router.push(`/auctions/${auction.id}/${auction.slug}`)
  })

  useEffect(() => {
    if (user == null) setModal('sign-in')
  }, [user])

  return (
    <div className="container mt-5">
      <AuthModal required={true} state={[modal, setModal]} />

      <h1 className='title'>New Auction</h1>

      <Form onSubmit={submit}>
        <TextField title='Title' type='text' {...register('title')} />
        <TextField title='Description' type='text' {...register('description')} />
        <Button title='Create' />
      </Form>
    </div>
  )
}
