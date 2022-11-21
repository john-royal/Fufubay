import Link from "next/link";

const Settings = () => {
    return (
        <div>
            <div>
                <h1 className="has-text-centered is-size-1">Settings</h1>
            </div>
            <div className="container">
            <div className="box">
                <h2 className="has-text-centered is-size-3 py-3 my-3">Profile</h2>
                <div className="has-text-centered">
                <Link href='#' className="button is-small">Edit</Link>
                </div>
            </div>
            <div className="box" >
                <h2 className="has-text-centered is-size-3">Account Information</h2>
                <div className="container">
                <div className="box">
                    <h3 className="has-text-centered is-size-4 py-3 my-3">Email</h3>
                    <div className="has-text-centered">
                    <Link href='#' className="button is-small">Edit</Link>
                    </div>
                </div>
                <div className="box">
                    <h3 className="has-text-centered is-size-4 py-3 my-3">Username</h3>
                    <div className="has-text-centered">
                    <Link href='#' className="button is-small">Edit</Link>
                    </div>
                </div>
                <div className="box">
                    <h3 className="has-text-centered is-size-4 py-3 my-3">Password</h3>
                    <div className="has-text-centered">
                    <Link href='#' className="button is-small">Edit</Link>
                    </div>
                </div>
                </div>
            </div>
            <div className="box">
                <h2 className="has-text-centered is-size-3 py-3 my-3">Address</h2>
                <h3 className="has-text-centered">[DIPLAY ADDRESS HERE]</h3>
                <div className="has-text-centered">
                <Link href='#' className="button is-small">Edit</Link>
                </div>
            </div>
            <div className="box">
                <h2 className="has-text-centered is-size-3 py-3 my-3">Billing</h2>
                <div className="has-text-centered">
                <Link href='#' className="button is-small">Edit</Link>
                </div>
            </div>
        </div>
        </div>
     );
}

export default Settings;