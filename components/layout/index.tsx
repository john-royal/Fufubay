import Head from 'next/head'
import Navbar from './navbar'
import { PropsWithChildren } from 'react'

export default function Layout ({ children }: PropsWithChildren) {
  return (
    <>
      <Head>
        <title>Fufubay</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar />
      {children}
    </>
  )
}
