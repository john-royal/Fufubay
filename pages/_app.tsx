import 'bulma'
import '../styles/global.css'
import { AppProps } from 'next/app'
import Head from 'next/head'
import Navbar from '../components/navbar'
import Search from '../components/search'

export default function FufubayApp ({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Fufubay</title>
        <meta name='description' content='Sell your stuff!' />
        <link rel='icon' href='/favicon.ico' />
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css' integrity='sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w==' crossOrigin='anonymous' referrerPolicy='no-referrer' />
      </Head>
      <Navbar {...pageProps} />
      <Search />
      <Component {...pageProps} />
    </>
  )
}
