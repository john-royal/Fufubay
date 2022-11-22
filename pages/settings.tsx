import Link from 'next/link'
import { AddressElement, Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe, StripeElements } from '@stripe/stripe-js'
import Stripe from 'stripe'
import { FormEvent, useEffect, useState } from 'react'
import useUser from '../lib/user'
import { post } from '../lib/request'
import Modal, { ModalProps } from '../components/modal'
import Router from 'next/router'

const stripePromise = loadStripe('pk_test_m8tbfxzzrHp1twla3WP3Cwar003SJUXAyx')

function StripeModal ({ isActive, handleClose, children }: ModalProps) {
  const [user] = useUser()
  const [setupIntent, setSetupIntent] = useState<Stripe.SetupIntent | null>()

  useEffect(() => {
    if (setupIntent != null) return

    post<{}, { setupIntent: Stripe.SetupIntent }>(`/api/users/${user?.id as number}/setup-intents`, {})
      .then(response => {
        console.log(response)
        if (response.success) setSetupIntent(response.data.setupIntent)
        else throw new Error(response.error.message)
      })
      .catch(error => { throw error })
  })

  const Form = () => {
    const [working, setWorking] = useState(false)
    const stripe = useStripe()
    const elements = useElements()
    const handleSave = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      setWorking(true)

      ;(async () => {
        const result = await stripe?.confirmSetup({ elements: elements as StripeElements, confirmParams: { return_url: window.location.href } })
        if (result?.error != null) {
          alert(result.error.message)
        } else {
          handleClose()
        }
      })()
        .catch(error => { alert(error) })
        .finally(() => setWorking(false))
    }

    return (
        <form onSubmit={handleSave}>
            {children}
            <button className={`button is-primary ${working ? 'is-loading' : ''}`}>Save</button>
        </form>
    )
  }

  const Body = (options: { clientSecret: string }) => {
    return <Elements stripe={stripePromise} options={options}>
        <Form />
    </Elements>
  }

  return (
    <Modal isActive={isActive} handleClose={handleClose}>
        {setupIntent != null ? <Body clientSecret={setupIntent.client_secret as string} /> : <></>}
    </Modal>
  )
}

export default function Settings () {
  const [editingAddress, setEditingAddress] = useState(false)
  const [editingPayment, setEditingPayment] = useState(false)

  return (
    <>
        <div>
            <h1 className='has-text-centered is-size-1'>Settings</h1>
        </div>
        <div className='container'>
            <div className='box'>
                <h2 className='has-text-centered is-size-3 py-3 my-3'>Profile</h2>
                <div className='has-text-centered'>
                <Link href='#' className='button is-small'>Edit</Link>
                </div>
            </div>
            <div className='box' >
                <h2 className='has-text-centered is-size-3'>Account Information</h2>
                <div className='container'>
                <div className='box'>
                    <h3 className='has-text-centered is-size-4 py-3 my-3'>Email</h3>
                    <div className='has-text-centered'>
                    <Link href='#' className='button is-small'>Edit</Link>
                    </div>
                </div>
                <div className='box'>
                    <h3 className='has-text-centered is-size-4 py-3 my-3'>Username</h3>
                    <div className='has-text-centered'>
                    <Link href='#' className='button is-small'>Edit</Link>
                    </div>
                </div>
                <div className='box'>
                    <h3 className='has-text-centered is-size-4 py-3 my-3'>Password</h3>
                    <div className='has-text-centered'>
                    <Link href='#' className='button is-small'>Edit</Link>
                    </div>
                </div>
                </div>
            </div>
            <div className='box'>
                <h2 className='has-text-centered is-size-3 py-3 my-3'>Address</h2>
                {/* TODO: Fetch and display user address details. */}
                <div className='has-text-centered'>
                    <button className='button is-small' onClick={e => setEditingAddress(true)}>Edit</button>
                </div>
                <StripeModal isActive={editingAddress} handleClose={() => setEditingAddress(false)}>
                    <AddressElement options={{ mode: 'shipping' }} />
                </StripeModal>
            </div>
            <div className='box'>
                <h2 className='has-text-centered is-size-3 py-3 my-3'>Billing</h2>
                {/* TODO: Display basic card details (e.g. "Visa ending in 0000") */}
                <div className='has-text-centered'>
                    <button className='button is-small' onClick={e => setEditingPayment(true)}>Edit</button>
                </div>
                <StripeModal isActive={editingPayment} handleClose={() => setEditingPayment(false)}>
                    <PaymentElement />
                </StripeModal>
            </div>
        </div>
    </>
  )
}
