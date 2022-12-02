import Router from 'next/router'
import { useEffect, useState } from 'react'
import Stripe from 'stripe'
import useSWR from 'swr'
import SettingsModal, { SettingsItem } from '../components/settings'
import UserHeader from '../components/users/user-header'
import request from '../lib/request'
import useUser from '../lib/user'

interface SectionOptions {
  title: string
  items: { [item in SettingsItem]?: string | null | undefined }
}

const formatAccountName = ({ brand, last4 }: { brand: string | null, last4: string }): string => {
  brand = brand ?? 'Account'
  return `${brand[0].toUpperCase() + brand.slice(1)} Ending in ${last4}`
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
            return formatAccountName({ brand, last4 })
          }
        })(),
        [SettingsItem.PAYOUT_ACCOUNT]: (() => {
          if (seller == null || !seller.charges_enabled || seller.external_accounts?.data.length === 0) return
          const account = seller.external_accounts?.data[0] as Stripe.BankAccount | Stripe.Card
          switch (account.object) {
            case 'bank_account': {
              return formatAccountName({ brand: account.bank_name, last4: account.last4 })
            }
            case 'card': {
              return formatAccountName(account)
            }
          }
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
    <div className="container mx-auto p-5">
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
          {Object.entries(items).map(([item, value]) => (
            <div key={item} className='level is-mobile'>
              <div className='level-left' style={{ maxWidth: '50%' }}>
                <div>
                  <h3 className='heading has-text-grey'>{item}</h3>
                  <p>{value ?? 'Not Set'}</p>
                </div>
              </div>
              <div className='level-right'>
                <button className='button is-small' onClick={() => setItem(item as SettingsItem)}>Edit {item}</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
