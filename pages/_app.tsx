import '../styles/globals.css'
import Head from 'next/head'
import type { AppProps } from 'next/app'

export default function App ({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Fufubay</title>
        <meta name="description" content="Sell your stuff!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
