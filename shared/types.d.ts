import * as Prisma from '@prisma/client'

export interface PaymentCard {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

export interface Address {
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  countryCode: string
}

export interface User extends Prisma.User {
  paymentCard?: PaymentCard
  address?: Address
}
