import Link from 'next/link'
import { useState } from 'react'
import { get } from '../lib/request'
import useUser from '../lib/user'
import AuthModal, { AuthScreen } from './auth'

export default function Navbar (pagePropsForDebug: any) {
  const [modal, setModal] = useState<AuthScreen | null>(null)
  const [user, setUser] = useUser()
  const [showMenu, setShowMenu] = useState(false)

  const signOut = () => {
    get('/api/auth/sign-out')
      .then(async () => {
        setUser(null)
      })
      .catch(err => alert(err))
  }

  return (
    <div className='navbar' role='navigation' aria-label='main navigation'>
        <div className='navbar-brand'>
            <Link className='navbar-item has-text-weight-bold is-size-4 is-uppercase' href='/'>
                Fufubay
            </Link>

            <button role='button' className={`navbar-burger ${showMenu ? 'is-active' : ''}`} aria-label='menu' aria-expanded={showMenu} data-target='navbar-menu' onClick={() => setShowMenu(!showMenu)}>
                <span aria-hidden='true'></span>
                <span aria-hidden='true'></span>
                <span aria-hidden='true'></span>
            </button>
        </div>

        <div id='navbar-menu' className={`navbar-menu ${showMenu ? 'is-active' : ''}`}>
            <div className='navbar-start'>
                <Link href='/' className='navbar-item'>
                    Home
                </Link>

                <Link href='/auctions/create' className='navbar-item'>
                    Sell With Us
                </Link>

                <div className='navbar-item has-dropdown is-hoverable'>
                    <a className='navbar-link'>
                        Debug
                    </a>
                    <div className='navbar-dropdown p-4'>
                        <h2 className='has-text-weight-bold'>Page Props</h2>
                        <pre>{JSON.stringify(pagePropsForDebug, null, 2)}</pre>
                    </div>
                </div>
            </div>

            <div className='navbar-end'>
                {user != null
                  ? <>
                    <div className='navbar-item'>
                        <div className='level'>
                            <span className='level-item mr-3'>Hi,&nbsp;<Link href='/settings' className='has-text-weight-bold'>{user.username}</Link></span>
                            <button className='button is-light level-item' onClick={signOut}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                  </>
                  : <>
                    <div className='navbar-item'>
                        <div className='buttons'>
                            <button className='button is-primary' onClick={e => setModal(AuthScreen.CREATE_ACCOUNT)}>
                                <strong>Sign up</strong>
                            </button>
                            <button className='button is-light' onClick={e => setModal(AuthScreen.SIGN_IN)}>
                                Log in
                            </button>
                        </div>
                    </div>
                  </>}
            </div>
        </div>
        <AuthModal required={false} state={[modal, setModal]} />
    </div>
  )
}
