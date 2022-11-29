import { useState } from 'react'
import { Button, Form, TextField } from '../common/form'
import Modal, { ModalProps, useModal } from '../common/modal'
import request from '../../lib/request'
import useUser from '../../lib/user'

export default function BidModal ({ auctionId, isActive, handleClose }: { auctionId: number } & ModalProps) {
  const { user } = useUser({ redirect: false })

  return (
    <Modal isActive={isActive} handleClose={handleClose}>
        {user == null ? <SignInPrompt /> : <BidForm userId={user.id} auctionId={auctionId} />}
    </Modal>
  )
}

function BidForm ({ userId, auctionId }: { userId: number, auctionId: number }) {
  const { handleClose } = useModal()
  const [amount, setAmount] = useState(0)

  const handleSubmit = async (): Promise<void> => {
    await request({
      method: 'POST',
      url: '/api/bids',
      body: {
        amount,
        auctionId,
        userId
      }
    })
    handleClose()
  }

  return (<>
      <h2 className='title'>Submit Bid</h2>
      <Form onSubmit={handleSubmit}>
          <TextField title='Bid Amount' name='amount' type='text' value={amount} onChange={e => setAmount(Number(e.target.value))} />
          <Button title='Bid' />
      </Form>
  </>)
}

function SignInPrompt () {
  const { handleClose } = useModal()

  return (
  <div className='has-text-centered'>
    <h2 className='title'>Sign In to Bid</h2>
    <p>To submit a bid, please sign in or create an account.</p>
    <button className='button is-primary mt-5' onClick={handleClose}>Exit</button>
  </div>
  )
}
