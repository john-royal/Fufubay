import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PropsWithChildren, useEffect, useState } from 'react'
import Stripe from 'stripe'
import { post } from '../lib/request'
import useUser from '../lib/user'

const stripePromise = loadStripe('pk_test_m8tbfxzzrHp1twla3WP3Cwar003SJUXAyx')

async function loadSetupIntent (userID: number): Promise<Stripe.SetupIntent> {
  const response = await post<{}, { setupIntent: Stripe.SetupIntent }>(`/api/users/${userID}/setup-intents`, {})
  if (response.success) {
    return response.data.setupIntent
  } else {
    throw new Error(response.error.message)
  }
}

export default function StripeContext ({ children }: PropsWithChildren) {
  const [user] = useUser()
  const [clientSecret, setClientSecret] = useState<string | null>()

  useEffect(() => {
    if (user == null || clientSecret != null) return

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
