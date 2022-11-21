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

  return (
    <AuthModalContext.Provider value={state}>
      <div className={`modal ${modal != null ? 'is-active' : ''}`}>
        <div className='modal-background'></div>
        <div className='modal-card'>
          <div className='modal-card-body'>
            <SignInForm />
            <CreateAccountForm />
          </div>
        </div>
        <button className='modal-close is-large' aria-label='Close' onClick={e => required ? router.back() : setModal(null)}></button>
      </div>
    </AuthModalContext.Provider>
  )
}
