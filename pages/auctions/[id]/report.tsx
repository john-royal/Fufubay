import { Auction } from '@prisma/client'
import { Button, Form, TextField } from 'components/common/form'
import Modal, { ModalProps } from 'components/common/modal'
import request from 'lib/request'
import useUser from 'lib/user'
import { useState } from 'react'

export type ReviewModalProps = { auction: Auction } & ModalProps

export default function ReviewModal ({ auction, isActive, handleClose }: ReviewModalProps) {
  const { user } = useUser({ redirect: false })
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    if (user?.id == null && name === '') {
      throw new Error('Please sign in or enter your name.')
    }
    await request({
      url: '/api/reports',
      method: 'POST',
      body: {
        customerName: user?.id == null ? name : undefined,
        message,
        auctionId: auction.id,
        customerId: user?.id,
        sellerId: auction.sellerId
      }
    })
    handleClose()
  }

  return (
    <Modal isActive={isActive} handleClose={handleClose}>
      <Form onSubmit={handleSubmit}>
        <h3 className='title'>Report Seller</h3>
        {user == null ? <TextField title='Name' type='text' name='name' value={name} onChange={e => setName(e.target.value)} /> : <></>}
        <TextField title='Comments' type='text' name='comments' value={message} onChange={e => setMessage(e.target.value)} />
        <Button title='Submit' />
      </Form>
    </Modal>
  )
}
