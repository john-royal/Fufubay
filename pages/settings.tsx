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
        [SettingsItem.PHONE_NUMBER]: user.phone
      }
    },
    {
      title: 'Payments',
      items: {
        [SettingsItem.CREDIT_CARD]: (() => {
          if (user.paymentCard == null) return
          const { brand, last4 } = user.paymentCard
          return `${brand} Ending in ${last4}`
        })(),
        [SettingsItem.ADDRESS]: (() => {
          if (user.address == null) return
          const { line1, line2, city, state, postalCode } = user.address
          return [line1, line2, city, state, postalCode].filter(item => item !== '').join(', ')
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
            <div key={title}>
                <hr />
                <section className='m-5'>
                    <h2 className='title is-4'>{title}</h2>
                    {Object.entries(items).map(([item, value]) => (
                        <div key={item} className='level'>
                            <div className='level-left'>
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
                </section>
            </div>
        ))}
    </div>
  )
}
