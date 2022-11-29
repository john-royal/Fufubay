import { Auction } from '@prisma/client'
import { withIronSessionSsr } from 'iron-session/next'
import Router from 'next/router'
import { FormEvent, useState } from 'react'
import { Button, Form, ImageField, TextField } from '../../components/common/form'
import { uploadImage } from '../../lib/images'
import request from '../../lib/request'
import useUser from '../../lib/user'
import { sessionOptions } from '../../shared/session'

export default function CreateAuctionPage () {
  useUser()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (title === '') {
      throw new Error('Please enter a title.')
    }
    if (description === '') {
      throw new Error('Please enter a description.')
    }
    if (image == null) {
      throw new Error('Please select an image.')
    }
    const auction = await request<Auction>({
      method: 'POST',
      url: '/api/auctions',
      body: {
        title,
        description
      }
    })
    await uploadImage(`/api/auctions/${auction.id}/image`, image)
    await Router.push(`/auctions/${auction.id}/${auction.slug}`)
  }

  return (
    <div className='container mt-5'>
      <h1 className='title'>New Auction</h1>

      <Form onSubmit={handleSubmit}>
        <TextField title='Title' type='text' id='title' name='title' value={title} onChange={e => setTitle(e.target.value)}/>
        <TextField title='Description' type='text' id='description' name='description' value={description} onChange={e => setDescription(e.target.value)} />
        <ImageField onImageChange={setImage} />
        <Button title='Create' className='mt-5' />
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
