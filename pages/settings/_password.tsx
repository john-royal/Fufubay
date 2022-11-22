import { useState } from 'react'
import { Button, Form } from '../../components/form'
import Modal, { ModalProps } from '../../components/modal'
import request from '../../lib/request'
import useUser from '../../lib/user'

export default function PasswordModal ({ isActive, handleClose }: ModalProps) {
  const [user] = useUser()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async () => {
    if (user == null) return
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
    <Modal isActive={isActive} handleClose={handleClose}>
        <h1 className='title'>Password</h1>

        <Form onSubmit={handleSubmit}>
            <div className='field'>
                <label htmlFor='password' className='label'>Password</label>
                <div className='control'>
                    <input type='password' name='password' className='input' placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
            </div>
            <div className='field'>
                <label htmlFor='confirm-password' className='label'>Confirm Password</label>
                <div className='control'>
                    <input type='password' name='confirm-password' className='input' placeholder='Confirm Password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
            </div>
            <Button title='Save' className='mt-4' />
        </Form>
    </Modal>
  )
}
