import { User } from '@prisma/client'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PropsWithChildren, useEffect, useState } from 'react'
import Stripe from 'stripe'
import request from '../lib/request'
import useUser from '../lib/user'

const stripePromise = loadStripe('pk_test_m8tbfxzzrHp1twla3WP3Cwar003SJUXAyx')

async function loadSetupIntent (userID: number): Promise<Stripe.SetupIntent> {
  const response = await request<{ setupIntent: Stripe.SetupIntent }>({
    method: 'POST',
    url: `/api/users/${userID}/setup-intents`,
    body: {}
  })
  return response.setupIntent
}

export default function StripeContext ({ children }: PropsWithChildren) {
  const { user } = useUser() as { user: User }
  const [clientSecret, setClientSecret] = useState<string | null>()

  useEffect(() => {
    if (clientSecret != null) return

    loadSetupIntent(user.id)
      .then(setupIntent => setClientSecret(setupIntent.client_secret))
      .catch(error => { throw error })
  }, [user, clientSecret])

  if (clientSecret != null) {
    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            {children}
        </Elements>
    )
  } else {
    return <></>
  }
}
