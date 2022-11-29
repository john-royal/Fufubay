import Head from 'next/head'
import Navbar from './navbar'
import Search from './search'
import { PropsWithChildren } from 'react'

export default function Layout ({ children }: PropsWithChildren) {
  return (
    <>
      <Head>
        <title>Fufubay</title>
        <link rel='icon' href='/favicon.ico' />
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css' integrity='sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w==' crossOrigin='anonymous' referrerPolicy='no-referrer' />
      </Head>
      <Navbar />
      <Search />
      {children}
    </>
  )
}
