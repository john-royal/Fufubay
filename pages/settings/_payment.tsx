import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button, Form } from '../../components/form'
import Modal, { ModalProps } from '../../components/modal'
import StripeContext from '../../components/stripe'

export default function PaymentModal ({ isActive, handleClose }: ModalProps) {
  const PaymentForm = () => {
    const stripe = useStripe()
    const elements = useElements()

    const handleSubmit = async () => {
      if (stripe == null || elements == null) return
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required'
      })
      if (result.error != null) {
        throw new Error(result.error.message)
      }
      handleClose()
    }

    return (
        <Form onSubmit={handleSubmit}>
          <PaymentElement />
          <Button title='Save' className='mt-4' />
        </Form>
    )
  }

  return (
    <Modal isActive={isActive} handleClose={handleClose}>
      <h1 className='title'>Credit Card</h1>

      <StripeContext>
        <PaymentForm />
      </StripeContext>
    </Modal>
  )
}
