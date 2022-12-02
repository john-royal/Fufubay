import { useEffect, useState } from 'react'
import SettingsModal, { SettingsItem } from '../components/settings'
import UserHeader from '../components/users/user-header'
import useUser from '../lib/user'

interface SectionOptions {
  title: string
  items: { [item in SettingsItem]?: string | null | undefined }
}

export default function SettingsPage () {
  const { user, setUser } = useUser()
  const [item, setItem] = useState<SettingsItem | null>(null)

  useEffect(() => {
    if (user != null && item == null) void setUser()
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
            return `${brand[0].toUpperCase() + brand.slice(1)} Ending in ${last4}`
          }
        })(),
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
    <div className="container mt-5">
      <SettingsModal item={item} setItem={setItem} />
      <UserHeader {...user}>
        <button className='button is-small' onClick={() => setItem(SettingsItem.PROFILE)}>Edit Profile</button>
      </UserHeader>
      {sections.map(({ title, items }) => (
        <div key={title} className='m-5'>
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
