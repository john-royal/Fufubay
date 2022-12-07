import { User } from '@prisma/client'
import { AddressElement } from '@stripe/react-stripe-js'
import { StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { useState } from 'react'
import Stripe from 'stripe'
import request from '../../lib/request'
import useUser from '../../lib/user'
import { Button, Form } from '../common/form'
import { useModal } from '../common/modal'
import StripeContext from './stripe'

export default function AddressModal () {
  const { user } = useUser() as { user: User }
  const { handleClose } = useModal()

  const [address, setAddress] = useState<Stripe.Address>({
    line1: user.addressLine1,
    line2: user.addressLine2,
    city: user.addressCity,
    state: user.addressState,
    postal_code: user.addressPostalCode,
    country: user.addressCountry
  })

  const handleChange = (e: StripeAddressElementChangeEvent) => setAddress(e.value.address)

  const handleSubmit = async () => {
    const body: Partial<User> = {
      addressLine1: address.line1,
      addressLine2: address.line2,
      addressCity: address.city,
      addressState: address.state,
      addressPostalCode: address.postal_code,
      addressCountry: address.country
    }
    const requiredProperties: Array<keyof User> = ['addressLine1', 'addressCity', 'addressState', 'addressPostalCode', 'addressCountry']
    if (requiredProperties.find(property => body[property] == null || body[property] === '') != null) {
      throw new Error('Your address is incomplete.')
    }
    await request({
      method: 'PUT',
      url: `/api/users/${user.id}/address`,
      body
    })
    handleClose()
  }

  return (
    <>
      <h1 className='title'>Address</h1>

      <Form onSubmit={handleSubmit}>
        <StripeContext>
          <AddressElement options={{ mode: 'shipping' }} onChange={handleChange} onEscape={handleClose} />
          <Button title='Save' className='mt-4' />
        </StripeContext>
      </Form>
    </>
  )
}
