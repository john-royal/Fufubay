import Stripe from 'stripe'

export default new Stripe(process.env.STRIPE_API_KEY ?? '', { apiVersion: '2022-11-15' })