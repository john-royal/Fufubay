import { useState } from 'react'
import { Button, Form, TextField } from '../../components/form'
import Modal, { ModalProps } from '../../components/modal'
import request from '../../lib/request'
import useUser from '../../lib/user'

export default function EmailModal ({ isActive, handleClose }: ModalProps) {
  const [user] = useUser()
  const [email, setEmail] = useState('')

  const handleSubmit = async () => {
    if (user == null) return

    await request({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: { email }
    })
    handleClose()
  }

  return (
    <Modal isActive={isActive} handleClose={handleClose}>
      <h1 className='title'>Email Address</h1>

      <Form onSubmit={handleSubmit}>
        <TextField title='Email' name='email' type='email' value={email} onChange={e => setEmail(e.target.value)} />
        <Button title='Save' className='mt-4' />
      </Form>
    </Modal>
  )
}
