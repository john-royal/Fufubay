import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import useUser from '../../lib/user'
import Modal from '../modal'
import CreateAccountForm from './create-account'
import SignInForm from './sign-in'

export type Screen = 'create-account' | 'sign-in' | null

export type SetScreen = (screen: Screen) => void

export type StateHandler = [Screen, (state: Screen) => void]

export default function AuthModal ({ state }: { state: StateHandler }) {
  const router = useRouter()
  const [screen, setScreen] = state
  const { user } = useUser({ redirect: false })

  useEffect(() => {
    if (user != null) {
      if (typeof router.query.redirect === 'string') {
        void router.push(router.query.redirect)
      }
      setScreen(null)
    }
  }, [user, router.query.redirect]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (typeof router.query.redirect === 'string') {
      void router.replace(router.basePath)
    }
    setScreen(null)
  }

  return (
    <Modal isActive={screen != null} handleClose={handleClose}>
      {screen === 'create-account' ? <CreateAccountForm setScreen={setScreen} /> : <SignInForm setScreen={setScreen} />}
    </Modal>
  )
}
