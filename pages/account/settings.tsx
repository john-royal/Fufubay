import Router from 'next/router'
import { useEffect, useState } from 'react'
import Stripe from 'stripe'
import useSWR from 'swr'
import SettingsModal, { SettingsItem } from '../../components/settings'
import UserHeader from '../../components/users/user-header'
import request from '../../lib/request'
import useUser from '../../lib/user'
import AccountLayout from './_layout'

interface SectionOptions {
  title: string
  items: { [item in SettingsItem]?: string | undefined }
}

const formatAccountName = (brand: string = 'Account', last4: string): string => {
  brand = brand[0].toUpperCase() + brand.slice(1)
  return `${brand} Ending in ${last4}`
}

export default function SettingsPage () {
  const { user, setUser } = useUser()
  const [item, setItem] = useState<SettingsItem | null>(null)
  const { data: seller } = useSWR<Stripe.Response<Stripe.Account>>(`/api/users/${user?.id as number}/seller`, async url => {
    return await request<Stripe.Response<Stripe.Account>>({
      method: 'GET',
      url
    })
  })

  useEffect(() => {
    if (user == null) return
    if (item == null) void setUser()
    if (item === SettingsItem.PAYOUT_ACCOUNT) void Router.push(`/api/users/${user.id}/seller-login`)
  }, [user, item, setUser])

  if (user == null) {
    return <></>
  }

  const sections: SectionOptions[] = [
    {
      title: 'Account',
      items: { [SettingsItem.PASSWORD]: '*********' }
    },
    {
      title: 'Contact',
      items: {
        [SettingsItem.EMAIL_ADDRESS]: user.email,
        [SettingsItem.PHONE_NUMBER]: (() => {
          const parts = user.phone?.match(/^(\d{3})(\d{3})(\d{4})$/)
          if (parts == null) return
          return `(${parts[1]}) ${parts[2]}-${parts[3]}`
        })()
      }
    },
    {
      title: 'Payments',
      items: {
        [SettingsItem.CREDIT_CARD]: (() => {
          const { paymentCardBrand: brand, paymentCardLast4: last4 } = user
          if (brand != null && last4 != null) {
            return formatAccountName(brand, last4)
          }
        })(),
        [SettingsItem.PAYOUT_ACCOUNT]: (() => {
          if (seller == null || !seller.charges_enabled || seller.external_accounts?.data.length === 0) return
          const account = seller.external_accounts?.data[0] as Stripe.BankAccount | Stripe.Card
          const brand = (account as Stripe.Card)?.brand ?? (account as Stripe.BankAccount)?.bank_name ?? 'Account'
          return formatAccountName(brand, account.last4)
        })()
      }
    },
    {
      title: 'Shipping',
      items: {
        [SettingsItem.ADDRESS]: (() => {
          const { addressLine1, addressLine2, addressCity, addressState, addressPostalCode } = user
          const parts = [addressLine1, addressLine2, addressCity, addressState, addressPostalCode].filter(component => component != null)
          if (parts.length > 0) {
            return parts.join(', ')
          }
        })()
      }
    }
  ]

  return (
    <AccountLayout>
      <SettingsModal item={item} setItem={setItem} />
      <div className={`notification level is-dark ${seller?.charges_enabled ?? true ? 'is-hidden' : ''}`}>
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
      {sections.map(({ title, items }) => (
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
