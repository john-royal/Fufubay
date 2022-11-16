import { useEffect } from 'react'
import { useUser } from '../../lib/user'

export default function SignOut () {
  const [,setUser] = useUser()
  useEffect(() => {
    void setUser()
  })
  return (<></>)
}
