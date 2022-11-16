import { useAuthenticatedUser } from '../../lib/user'

export default function Profile () {
  const [user, setUser] = useAuthenticatedUser()

  return (
    <>
      <h1>User Profile</h1>
      <p>{JSON.stringify(user)}</p>
      <button onClick={e => { void setUser() }}>Sign Out</button>
    </>
  )
}
