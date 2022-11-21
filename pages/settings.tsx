import Link from "next/link";

const Settings = () => {
    return (
        <div>
            <div>
                <h1>Settings</h1>
            </div>
            <div>--------------</div>
            <div>
                <h2>Profile</h2>
                <Link href='#'>Edit</Link>
            </div>
            <div>---------------</div>
            <div>
                <h2>Account Information</h2>
                <div>
                    <h3>Email</h3>
                    <Link href='#'>Edit</Link>
                </div>
                <div>
                    <h3>Username</h3>
                    <Link href='#'>Edit</Link>
                </div>
                <div>
                    <h3>Password</h3>
                    <Link href='#'>Edit</Link>
                </div>
            </div>
            <div>-------------</div>
            <div>
                <h2>Address</h2>
                <h3>[DIPLAY ADDRESS HERE]</h3>
                <Link href='#'>Edit</Link>
            </div>
            <div>-------------</div>
            <div>
                <h2>Billing</h2>
                <Link href='#'>Edit</Link>
            </div>
        </div>
     );
}

export default Settings;