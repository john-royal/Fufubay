import { withIronSessionSsr } from 'iron-session/next'
import { createContext, useContext, useEffect, useState } from 'react'
import useSWR from 'swr'
import UserHeader from '../../components/user-header'
import request from '../../lib/request'
import useUser from '../../lib/user'
import { sessionOptions } from '../../shared/session'
import { User } from '../../shared/types'
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
  useUser()
  const { data: user, mutate } = useSWR<User>('/api/users/me', async url => {
    return await request({
      method: 'GET',
      url
    })
  })
  const [item, setItem] = useState<Item | null>(null)

  useEffect(() => {
    if (item == null && user != null) void mutate()
  }, [item, user, mutate])

  if (user == null) return <></>

  return (
    <ModalContext.Provider value={[item, setItem]}>
        <Modal />
        <SettingsPageBody user={user} />
    </ModalContext.Provider>
  )
}

function SettingsPageBody ({ user }: { user: User }) {
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
          if (user.paymentCard == null) return
          const { brand, last4 } = user.paymentCard
          return `${brand} Ending in ${last4}`
        })(),
        [Item.ADDRESS]: (() => {
          if (user.address == null) return
          const { line1, line2, city, state, postalCode } = user.address
          return [line1, line2, city, state, postalCode].filter(item => item != null).join(', ')
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
  return (
    <section className='m-5'>
        <h2 className='title is-4'>{title}</h2>
        {Object.entries(items).map(([item, value]) => (
            <ItemRow key={item} item={item as Item} value={value} />
        ))}
    </section>
  )
}

function ItemRow ({ item, value }: { item: Item, value: string | null | undefined }) {
  const [, setItem] = useContext(ModalContext)

  return (
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
