import Link from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'

export default function AccountLayout ({ children }: PropsWithChildren) {
  const { pathname } = useRouter()
  const menu = [
    { title: 'Settings', href: '/account/settings' },
    { title: 'My Auctions', href: '/account/auctions' }
  ]

  return (
    <div className="container columns mx-auto">
        <aside className="menu column is-2 p-5">
            <ul className="menu-list">
                {menu.map(item => (
                    <li key={item.href}>
                        <Link href={item.href} className={pathname === item.href ? 'is-active' : ''}>{item.title}</Link>
                    </li>
                ))}
            </ul>
        </aside>
        <main className="column p-5">
            {children}
        </main>
    </div>
  )
}
