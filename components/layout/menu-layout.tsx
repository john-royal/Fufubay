import Link from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'

export interface MenuItem {
  title: string
  path: string
}

export default function MenuLayout ({ items, children }: { items: MenuItem[] } & PropsWithChildren) {
  const { pathname } = useRouter()

  return (
    <div className="container columns mx-auto">
        <aside className="menu column is-2 p-5">
            <ul className="menu-list">
                {items.map(item => (
                    <li key={item.path}>
                        <Link href={item.path} className={pathname === item.path ? 'is-active' : ''}>{item.title}</Link>
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
