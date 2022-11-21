import Link from 'next/link'
import { AddressElement, Elements, PaymentElement } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'
import { GetServerSidePropsContext } from 'next'
import { useState } from 'react'

const stripePromise = loadStripe('pk_test_m8tbfxzzrHp1twla3WP3Cwar003SJUXAyx')

interface Props {
  customer: Stripe.Customer
  setupIntent: Stripe.Response<Stripe.SetupIntent>
}

export async function getServerSideProps ({ req }: GetServerSidePropsContext) {
  const response = await fetch('http://localhost:8080/api/users/setup-intents', {
    method: 'POST',
    headers: req.headers as Record<string, string>
  })
  const json = await response.json()
  return {
    props: { ...json.data }
  }
}

export default function Settings ({ customer, setupIntent }: Props) {
  const [showEditPayment, setShowEditPayment] = useState(false)
  const [showEditAddress, setShowEditAddress] = useState(false)
  const options = { clientSecret: setupIntent.client_secret as string }

  return (
    <Elements stripe={stripePromise} options={options}>
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
                {/* TODO: Display address details more elegantly. */}
                <h3 className='has-text-centered'>{JSON.stringify(customer.address)}</h3>
                <form className={showEditAddress ? '' : 'is-hidden'}>
                    <AddressElement options={{ mode: 'shipping' }} />
                    <button className='button is-primary'>Save</button>
                    {/* TODO: When form is submitted, confirm setup intent to save information. */}
                </form>
                <div className='has-text-centered'>
                    <button className='button is-small' onClick={e => setShowEditAddress(true)}>Edit</button>
                </div>
            </div>
            <div className='box'>
                <h2 className='has-text-centered is-size-3 py-3 my-3'>Billing</h2>
                {/* TODO: Display basic card details (e.g. "Visa ending in 0000") */}
                <form className={showEditPayment ? '' : 'is-hidden'}>
                    <PaymentElement />
                    <button className='button is-primary'>Save</button>
                    {/* TODO: When form is submitted, confirm setup intent to save information. */}
                </form>
                <div className='has-text-centered'>
                    <button className='button is-small' onClick={e => setShowEditPayment(true)}>Edit</button>
                </div>
            </div>
        </div>
    </Elements>
  )
}
