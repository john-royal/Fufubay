import Link from 'next/link'
import useUser from '../lib/user'

export default function Navbar () {
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

                <Link href='/404' className='navbar-item'>
                    Documentation
                </Link>

                <div className='navbar-item has-dropdown is-hoverable'>
                        <Link href='/404' className='navbar-link'>
                        More
                        </Link>
                        <div className='navbar-dropdown'>
                        <Link href='/404' className='navbar-item'>
                            About
                        </Link>
                        <Link href='/404' className='navbar-item'>
                            Jobs
                        </Link>
                        <Link href='/404' className='navbar-item'>
                            Contact
                        </Link>
                    <hr className='navbar-divider' />
                        <Link href='/404' className='navbar-item'>
                            Report an issue
                        </Link>
                    </div>
                </div>
            </div>

            <div className='navbar-end'>
                <div className='navbar-item' style={{ display: user != null ? 'block' : 'none' }}>
                    <div className='level'>
                        <Link href='/auth/profile' className='level-item mr-3 has-text-weight-bold'>{user?.email}</Link>
                        <Link href='/auth/sign-out' className='button is-light level-item'>
                            Sign out
                        </Link>
                    </div>
                </div>
                <div className='navbar-item' style={{ display: user == null ? 'block' : 'none' }}>
                    <div className='buttons'>
                        <Link href='/auth/create-account' className='button is-primary'>
                            <strong>Sign up</strong>
                        </Link>
                        <Link href='/auth/sign-in' className='button is-light'>
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
