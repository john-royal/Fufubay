import Link from 'next/link'
import { useRouter } from 'next/router'
import { userURL } from '../lib/url'
import useUser from '../lib/user'

export default function Navbar (pagePropsForDebug: any) {
  const router = useRouter()
  const [user] = useUser()

  return (
    <div className='navbar' role='navigation' aria-label='main navigation'>
        <div className='navbar-brand'>
            <Link className='navbar-item has-text-weight-bold is-size-4 is-uppercase' href='/'>
                Fufubay
            </Link>

            <button role='button' className='navbar-burger' aria-label='menu' aria-expanded='false' data-target='navbarBasicExample'>
                <span aria-hidden='true'></span>
                <span aria-hidden='true'></span>
                <span aria-hidden='true'></span>
            </button>
        </div>

        <div id='navbarBasicExample' className='navbar-menu'>
            <div className='navbar-start'>
                <Link href='/' className='navbar-item'>
                    Home
                </Link>

                <Link href='/auctions/create' className='navbar-item'>
                    Sell With Us
                </Link>

                <div className='navbar-item has-dropdown is-hoverable'>
                    <Link href='#' className='navbar-link'>
                        Debug
                    </Link>
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
                            <span className='level-item mr-3'>Hi,&nbsp;<Link href={userURL(user)} className='has-text-weight-bold'>{user.username}</Link></span>
                            <Link href={`/auth/sign-out?redirect=${router.asPath}`} className='button is-light level-item'>
                                Sign Out
                            </Link>
                        </div>
                    </div>
                  </>
                  : <>
                    <div className='navbar-item'>
                        <div className='buttons'>
                            <Link href='/auth/create-account' className='button is-primary'>
                                <strong>Sign up</strong>
                            </Link>
                            <Link href='/auth/sign-in' className='button is-light'>
                                Log in
                            </Link>
                        </div>
                    </div>
                  </>}
            </div>
        </div>
    </div>
  )
}
