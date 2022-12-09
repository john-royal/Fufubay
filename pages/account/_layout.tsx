import MenuLayout, { MenuItem } from 'components/layout/menu-layout'
import { PropsWithChildren } from 'react'

export default function AccountLayout ({ children }: PropsWithChildren) {
  const items: MenuItem[] = [
    { title: 'Settings', path: '/account/settings' },
    { title: 'My Auctions', path: '/account/auctions' },
    { title: 'Previous Auctions', path: '/account/auctions' }
  ]

  return (
    <MenuLayout items={items}>
      {children}
    </MenuLayout>
  )
}
