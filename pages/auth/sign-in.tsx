import Link from 'next/link'

export default function SignIn () {
  return (
    <div className="container forms">
    <div className="form login">
        <header className="head">Login</header>

        <form action="#">
            <div className="field input-field">
                <input type="email" placeholder="Email" className="input" />
            </div>
            <div className="field input-field">
                <input type="password" placeholder="Password" className="password" />
            </div>
            <div className="form link">
                <a href="#" className="forgot-pass">Forgot password?</a>
            </div>
            <div className="field input-field">
                <button>Login</button>
            </div>
            <div className="form link">
            <Link href='/'>Home</Link>, <Link href='/auth/create-account'>Create an Account</Link>
            </div>
        </form>
    </div>

</div>
  )
}
