import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import request from '../../lib/request'
import useUser from '../../lib/user'
import AuthModal, { Screen } from '../auth'

export default function Navbar () {
  const router = useRouter()
  const { user, setUser } = useUser({ redirect: false })

  const [modal, setModal] = useState<Screen | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const signOut = () => {
    setSigningOut(true)

    request({
      method: 'DELETE',
      url: '/api/auth'
    })
      .then(async () => {
        if (router.asPath.match(/(\/account)|(\/admin)|(\/sell)/) != null) {
          void router.push('/')
        }
        await setUser(undefined)
      })
      .catch(err => alert(err))
      .finally(() => setSigningOut(false))
  }

  useEffect(() => {
    if (user == null && router.query.redirect != null) {
      setModal('sign-in')
    }
  }, [user, router.query])

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

                <Link href='/sell' className='navbar-item'>
                    Sell With Us
                </Link>
            </div>

            <div className='navbar-end'>
                {user != null
                  ? <>
                    <div className='navbar-item'>
                        <div className='level'>
                            <span className='level-item mr-3'>Hi,&nbsp;<Link href='/account/settings' className='has-text-weight-bold'>{user.username}</Link></span>
                            <button className={`button is-light level-item ${signingOut ? 'is-loading' : ''}`} onClick={signOut}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                  </>
                  : <>
                    <div className='navbar-item'>
                        <div className='buttons'>
                            <button className='button is-primary' onClick={e => setModal('create-account')}>
                                <strong>Sign Up</strong>
                            </button>
                            <button className='button is-light' onClick={e => setModal('sign-in')}>
                                Log In
                            </button>
                        </div>
                    </div>
                  </>}
            </div>
        </div>
        <AuthModal state={[modal, setModal]} />
    </div>
  )
}
