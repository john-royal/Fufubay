
import { useState } from 'react'
import { Button, Form, TextField } from '../../../components/form'
import Modal, { ModalProps } from '../../../components/modal'
import request from '../../../lib/request'
import useUser from '../../../lib/user'

export default function BidModal ({ auctionID, isActive, handleClose }: { auctionID: number } & ModalProps) {
  const [user] = useUser()

  const BidForm = () => {
    const [amount, setAmount] = useState(0)

    const handleSubmit = async (): Promise<void> => {
      await request({
        method: 'POST',
        url: '/api/bids',
        body: {
          amount,
          auctionID,
          userID: user?.id
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

  const SignInPrompt = () => (<div className='has-text-centered'>
  <h2 className='title'>Sign In to Bid</h2>
  <p>To submit a bid, please sign in or create an account.</p>
  <button className='button is-primary mt-5' onClick={handleClose}>Exit</button>
</div>)

  return (
    <Modal isActive={isActive} handleClose={handleClose}>
        {user == null ? <SignInPrompt /> : <BidForm />}
    </Modal>
  )
}
