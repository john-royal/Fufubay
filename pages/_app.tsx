import 'bulma'
import { AppProps } from 'next/app'
import Head from 'next/head'
import Navbar from '../components/navbar'

export default function FufubayApp ({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Fufubay</title>
        <meta name='description' content='Sell your stuff!' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Navbar {...pageProps} />
      <Component {...pageProps} />
    </>
  )
}
