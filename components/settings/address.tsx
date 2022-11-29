import { AddressElement } from '@stripe/react-stripe-js'
import { StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { useState } from 'react'
import { Button, Form } from '../common/form'
import { useModal } from '../common/modal'
import StripeContext from './stripe'
import request from '../../lib/request'
import useUser from '../../lib/user'
import { User } from '../../shared/types'

export default function AddressModal () {
  const { user } = useUser() as { user: User }
  const { handleClose } = useModal()

  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    countryCode: ''
  })

  const handleChange = (e: StripeAddressElementChangeEvent) => {
    const { line1, line2, city, state, postal_code: postalCode, country } = e.value.address
    setAddress({
      line1,
      line2: line2 ?? '',
      city,
      state,
      postalCode,
      countryCode: country
    })
  }

  const handleSubmit = async () => {
    const { line1, city, state, postalCode } = address
    if ([line1, city, state, postalCode].find(item => item == null || item === '') != null) {
      throw new Error('Your address is incomplete.')
    }
    await request({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: {
        address
      }
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
