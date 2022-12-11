import { Button, Form, TextField } from 'components/common/form'
import Modal, { ModalProps } from 'components/common/modal'
import request from 'lib/request'
import useUser from 'lib/user'
import { useState } from 'react'
import Star from './star'

export type ReviewModalProps = { sellerId: number } & ModalProps

export default function ReviewModal ({ sellerId, isActive, handleClose }: ReviewModalProps) {
  const { user } = useUser()
  const [rating, setRating] = useState(0)
  const [comments, setComments] = useState('')

  const handleSubmit = async () => {
    if (user?.id == null) {
      throw new Error('You must be signed in to rate a user.')
    }
    if (rating === 0) {
      throw new Error('Your rating must be between 1 and 5.')
    }
    await request({
      url: '/api/reviews',
      method: 'POST',
      body: {
        rating,
        comments,
        customerId: user.id,
        sellerId
      }
    })
    handleClose()
  }

  return (
    <Modal isActive={isActive} handleClose={handleClose}>
      <Form onSubmit={handleSubmit}>
        <h3 className="title mb-6">Review Seller</h3>
        <Star rating={rating} setRating={setRating} />
        <TextField title='Comments' type='text' name='comments' value={comments} onChange={e => setComments(e.target.value)} />
        <Button title='Submit' />
      </Form>
    </Modal>
  )
}
