import 'bulma'
import '../styles/global.css'
import { AppProps } from 'next/app'
import Layout from '../components/layout'

export default function FufubayApp ({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
