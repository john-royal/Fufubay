import { User } from '@prisma/client'
import { withIronSessionSsr } from 'iron-session/next'
import { createContext, Fragment, useContext, useEffect, useState } from 'react'
import Stripe from 'stripe'
import useSWR from 'swr'
import UserHeader from '../../components/user-header'
import request from '../../lib/request'
import useUser from '../../lib/user'
import { sessionOptions } from '../../shared/session'
import AddressModal from './_address'
import EmailModal from './_email'
import PasswordModal from './_password'
import PaymentModal from './_payment'
import ProfileModal from './_profile'

enum Item {
  PROFILE = 'Profile',
  PASSWORD = 'Password',
  EMAIL_ADDRESS = 'Email Address',
  CREDIT_CARD = 'Credit Card',
  ADDRESS = 'Address'
}

interface Props {
  user: User
  customer: Stripe.Customer
  paymentMethods: Stripe.ApiList<Stripe.PaymentMethod>
}

type ModalStateType = [Item | null, (item: Item | null) => void]

const ModalContext = createContext<ModalStateType>([null, () => {}])

interface SectionOptions {
  title: string
  items: { [item in Item]?: string | null | undefined }
}

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  if (req.session.user == null) {
    return {
      redirect: { destination: '/?redirect=/settings', permanent: false }
    }
  } else {
    return { props: {} }
  }
}, sessionOptions)

export default function SettingsPage () {
  const { user } = useUser()
  const { data, mutate } = useSWR<Props>(`/api/users/${user?.id as number}/stripe`, async url => {
    return await request({
      method: 'GET',
      url
    })
  })
  const [item, setItem] = useState<Item | null>(null)

  useEffect(() => {
    if (item == null && data != null) void mutate()
  }, [item, data, mutate])

  if (data == null) return <></>

  return (
    <ModalContext.Provider value={[item, setItem]}>
        <Modal />
        <SettingsPageBody {...data} />
    </ModalContext.Provider>
  )
}

function SettingsPageBody ({ user, customer, paymentMethods }: Props) {
  const [, setItem] = useContext(ModalContext)
  const sections: SectionOptions[] = [
    {
      title: 'Account',
      items: { [Item.PASSWORD]: '*********' }
    },
    {
      title: 'Contact',
      items: {
        [Item.EMAIL_ADDRESS]: user.email
      }
    },
    {
      title: 'Payments',
      items: {
        [Item.CREDIT_CARD]: (() => {
          if (paymentMethods.data.length > 0) {
            const card = paymentMethods.data[0].card as Stripe.PaymentMethod.Card
            const brand = card.brand[0].toUpperCase() + card.brand.slice(1)
            return `${brand} Ending in ${card.last4}`
          }
        })(),
        [Item.ADDRESS]: (() => {
          if (customer.address == null) return
          const { line1, line2, city, state, postal_code: postalCode } = customer.address
          return [line1, line2, city, state, postalCode].filter(item => item !== '').join(', ')
        })()
      }
    }
  ]

  return (
    <div className='container mt-5'>
        <UserHeader {...(user)}>
            <button className='button is-small' onClick={() => setItem(Item.PROFILE)}>Edit Profile</button>
        </UserHeader>
        {sections.map(({ title, items }) => (
            <div key={title}>
                <hr />
                <Section title={title} items={items} />
            </div>
        ))}
    </div>
  )
}

function Section ({ title, items }: SectionOptions) {
  const [, setItem] = useContext(ModalContext)

  const ItemRow = ({ item, value }: { item: Item, value: string | null | undefined }) => (
    <div className='level'>
        <div className='level-left'>
            <div>
                <h3 className='heading has-text-grey'>{item}</h3>
                <p>{value ?? 'Not Set'}</p>
            </div>
        </div>
        <div className='level-right'>
            <button className='button is-small' onClick={() => setItem(item)}>Edit {item}</button>
        </div>
    </div>
  )

  return (
    <section className='m-5'>
        <h2 className='title is-4'>{title}</h2>
        {Object.entries(items).map(([item, value]) => (
            <ItemRow key={item} item={item as Item} value={value} />
        ))}
    </section>
  )
}

function Modal () {
  const [item, setItem] = useContext(ModalContext)

  switch (item) {
    case Item.PROFILE:
      return <ProfileModal isActive={item === Item.PROFILE} handleClose={() => setItem(null)} />
    case Item.PASSWORD:
      return <PasswordModal isActive={item === Item.PASSWORD} handleClose={() => setItem(null)} />
    case Item.EMAIL_ADDRESS:
      return <EmailModal isActive={item === Item.EMAIL_ADDRESS} handleClose={() => setItem(null)} />
    case Item.CREDIT_CARD:
      return <PaymentModal isActive={item === Item.CREDIT_CARD} handleClose={() => setItem(null)} />
    case Item.ADDRESS:
      return <AddressModal isActive={item === Item.ADDRESS} handleClose={() => setItem(null)} />
    case null:
      return <></>
  }
}
