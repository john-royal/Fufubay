import { User, UserRole } from '@prisma/client'
import prisma from 'api-lib/common/prisma'
import request from 'lib/request'
import Link from 'next/link'
import Router from 'next/router'
import { useState } from 'react'
import AdminLayout from './_layout'

export default function UsersAdminPage ({ users }: { users: User[] }) {
  return (
    <AdminLayout>
        <table className="table is-fullwidth">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td><Link href='/users/[id]/[username]' as={`/users/${user.id}/${user.username}`}>{user.username}</Link></td>
                        <td>{user.email}</td>
                        <td><SelectUserRole user={user} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </AdminLayout>
  )
}

function SelectUserRole ({ user }: { user: User }) {
  const [value, setValue] = useState(user.role)
  const [loading, setLoading] = useState(false)

  const handleSave = () => {
    setLoading(true)

    const body: Partial<User> = { role: value }

    request({
      method: 'PUT',
      url: `/api/users/${user.id}/role`,
      body
    })
      .then(async () => await Router.replace(Router.asPath))
      .catch(err => alert(err))
      .finally(() => setLoading(false))
  }

  const saveButton = <button className={`button is-small ${loading ? 'is-loading' : ''}`} onClick={handleSave}>Save</button>

  return (
    <>
        <div className="select is-small">
            <select value={value} onChange={e => setValue(e.target.value as UserRole)}>
                {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>{role}</option>
                ))}
            </select>
        </div>
        {value !== user.role ? saveButton : <></>}
    </>
  )
}

export async function getServerSideProps () {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return { props: { users } }
}
