import { useRouter } from 'next/router'
import React from 'react'
import CreateAccountForm from './create-account'
import SignInForm from './sign-in'

export enum AuthScreen {
  SIGN_IN, CREATE_ACCOUNT
}

export type StateHandler = [AuthScreen | null, (state: AuthScreen | null) => void]

export const AuthModalContext = React.createContext<StateHandler>([null, () => {}])

export default function AuthModal ({ required, state }: { required: boolean, state: StateHandler }) {
  const [modal, setModal] = state
  const router = useRouter()

  const handleClose = () => required ? router.back() : setModal(null)

  return (
    <AuthModalContext.Provider value={state}>
      <div className={`modal ${modal != null ? 'is-active' : ''}`}>
        <div className='modal-background' onClick={handleClose}></div>
        <div className='modal-card'>
          <div className='modal-card-body p-6'>
            <SignInForm />
            <CreateAccountForm />
          </div>
        </div>
        <button className='modal-close is-large' aria-label='Close' onClick={handleClose}></button>
      </div>
    </AuthModalContext.Provider>
  )
}
