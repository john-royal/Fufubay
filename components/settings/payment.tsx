import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button, Form } from '../common/form'
import { useModal } from '../common/modal'
import StripeContext from './stripe'
import request from '../../lib/request'
import useUser from '../../lib/user'

function PaymentForm () {
  const { user } = useUser()
  const stripe = useStripe()
  const elements = useElements()
  const { handleClose } = useModal()

  const handleSubmit = async () => {
    if (stripe == null || elements == null || user == null) return

    const result = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required'
    })
    if (result.error != null) {
      throw new Error(result.error.message)
    }
    await request({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: {
        paymentCardId: result.setupIntent.payment_method
      }
    })
    handleClose()
  }

  return (
    <Form onSubmit={handleSubmit}>
      <PaymentElement onEscape={() => handleClose()} />
      <Button title='Save' className='mt-4' />
    </Form>
  )
}

export default function PaymentModal () {
  return (
    <>
      <h1 className='title'>Credit Card</h1>

      <StripeContext>
        <PaymentForm />
      </StripeContext>
    </>
  )
}
