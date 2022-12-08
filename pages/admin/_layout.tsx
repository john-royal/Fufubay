import MenuLayout, { MenuItem } from 'components/layout/menu-layout'
import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'

export default function AdminLayout ({ children }: PropsWithChildren) {
  const router = useRouter()
  const items: MenuItem[] = [
    { title: 'Home', path: '/admin' },
    { title: 'Users', path: '/admin/users' },
    { title: 'Auctions', path: '/admin/auctions' },
    { title: 'Reports', path: '/admin/reports' }
  ]

  return (
    <MenuLayout items={items}>
      <h1 className='title has-text-weight-bold'>{items.find(({ path }) => path === router.pathname)?.title}</h1>
      <hr />
      {children}
    </MenuLayout>
  )
}
