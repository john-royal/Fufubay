import { User } from '@prisma/client'
import { useState } from 'react'
import request from '../../lib/request'
import useUser from '../../lib/user'
import { Button, Form, TextField } from '../common/form'
import { useModal } from '../common/modal'

export default function PasswordModal () {
  const { user } = useUser() as { user: User }
  const { handleClose } = useModal()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.')
    }

    await request({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: { password }
    })
    handleClose()
  }

  return (
    <>
        <h1 className='title'>Password</h1>

        <Form onSubmit={handleSubmit}>
            <TextField title='Password' name='password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
            <TextField title='Confirm Password' name='confirm-password' type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <Button title='Save' className='mt-4' />
        </Form>
    </>
  )
}
