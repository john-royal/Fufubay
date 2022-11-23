import { User } from '@prisma/client'
import { AddressElement } from '@stripe/react-stripe-js'
import { useState } from 'react'
import Stripe from 'stripe'
import { Button, Form } from '../../components/form'
import Modal, { ModalProps } from '../../components/modal'
import StripeContext from '../../components/stripe'
import request from '../../lib/request'
import useUser from '../../lib/user'

export default function AddressModal ({ isActive, handleClose }: ModalProps) {
  const { user } = useUser() as { user: User }
  const [address, setAddress] = useState<Stripe.Address>({
    line1: '',
    line2: null,
    city: '',
    state: '',
    postal_code: '',
    country: ''
  })

  const handleSubmit = async () => {
    await request({
      method: 'PATCH',
      url: `/api/users/${user.id}/stripe`,
      body: { address }
    })
  }

  return (
    <Modal isActive={isActive} handleClose={handleClose}>
      <h1 className='title'>Address</h1>

      <Form onSubmit={handleSubmit}>
        <StripeContext>
          <AddressElement options={{ mode: 'shipping' }} onChange={e => setAddress(e.value.address)} onEscape={() => handleClose()} />
          <Button title='Save' className='mt-4' />
        </StripeContext>
      </Form>
    </Modal>
  )
}
