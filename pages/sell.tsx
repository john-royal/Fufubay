import { Auction } from '@prisma/client'
import { Button, Form, ImageField, TextArea, TextField } from 'components/common/form'
import { format } from 'date-fns'
import { uploadImage } from 'lib/images'
import request from 'lib/request'
import useUser from 'lib/user'
import Router from 'next/router'
import { FormEvent, useState } from 'react'

export default function CreateAuctionPage () {
  const { user } = useUser()
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [startsAt, setStartsAt] = useState(new Date())
  const [endsAt, setEndsAt] = useState(new Date(Date.now() + (7 * 86400 * 1000)))
  const [image, setImage] = useState<File | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (title === '') {
      throw new Error('Please enter a title.')
    }
    if (subtitle === '') {
      throw new Error('Please enter a subtitle.')
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
        subtitle,
        description,
        startsAt,
        endsAt,
        sellerId: user?.id as number
      }
    })
    await uploadImage(`/api/auctions/${auction.id}/image`, image)
    await Router.push(`/auctions/${auction.id}/${auction.slug}`)
  }

  return (
    <div className='container p-5'>
      <h1 className='title'>New Auction</h1>

      <Form onSubmit={handleSubmit}>
        <TextField title='Title' type='text' id='title' name='title' value={title} onChange={e => setTitle(e.target.value)}/>
        <TextField title='Subtitle' type='text' id='subtitle' name='subtitle' value={subtitle} onChange={e => setSubtitle(e.target.value)} />
        <TextArea title='Description' id='description' name='description' value={description} onChange={e => setDescription(e.target.value)} />
        <TextField type='date' title='Start Date' id='startsAt' name='startsAt' value={format(startsAt, 'yyyy-LL-dd')} onChange={e => setStartsAt(new Date(e.target.value))} />
        <TextField type='date' title='End Date' id='endsAt' name='endsAt' value={format(endsAt, 'yyyy-LL-dd')} onChange={e => setEndsAt(new Date(e.target.value))} />
        <ImageField onImageChange={setImage} />
        <Button title='Create' className='mt-5' />
      </Form>
    </div>
  )
}
