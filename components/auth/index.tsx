import Router from 'next/router'
import React from 'react'
import Modal from '../modal'
import CreateAccountForm from './create-account'
import SignInForm from './sign-in'

export type Screen = 'create-account' | 'sign-in' | null

export type SetScreen = (screen: Screen) => void

export type StateHandler = [Screen, (state: Screen) => void]

export default function AuthModal ({ state }: { state: StateHandler }) {
  const [screen, setScreen] = state

  const handleClose = () => {
    void Router.replace(Router.basePath)
    setScreen(null)
  }

  const Body = () => {
    switch (screen) {
      case 'create-account':
        return <CreateAccountForm setScreen={setScreen} />
      case 'sign-in':
        return <SignInForm setScreen={setScreen} />
      case null:
        return <></>
    }
  }

  return (
    <Modal isActive={screen != null} handleClose={handleClose}>
      <Body />
    </Modal>
  )
}
