import 'bulma'
import Head from 'next/head'
import App, { AppContext, AppProps } from 'next/app'
import Navbar from '../components/navbar'
import { User } from '@prisma/client'
import { AuthContext } from '../lib/user'
import { verify } from 'jsonwebtoken'
import { useState } from 'react'

interface FufubayProps extends AppProps {
  userFromServer: User | null
}

export default function FufubayApp ({ Component, pageProps, userFromServer }: FufubayProps) {
  const [user, setUser] = useState(userFromServer)

  return (
    <AuthContext.Provider value={[user, setUser]}>
      <Head>
        <title>Fufubay</title>
        <meta name="description" content="Sell your stuff!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Component {...pageProps} />
    </AuthContext.Provider>
  )
}

FufubayApp.getInitialProps = async (app: AppContext) => {
  const props = await App.getInitialProps(app)
  const cookies = Object.fromEntries(app.ctx.req?.headers.cookie?.split(';').map(cookie => cookie.trim().split('=')) ?? [])
  const userFromServer = (() => {
    try {
      return verify(cookies.token ?? '', process.env.JWT_SECRET ?? '') as User
    } catch (error) {
      return null
    }
  })()
  return { ...props, userFromServer }
}
