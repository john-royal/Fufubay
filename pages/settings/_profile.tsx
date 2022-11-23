import { useState } from 'react'
import { Button, Form, TextField } from '../../components/form'
import Modal, { ModalProps } from '../../components/modal'
import request from '../../lib/request'
import useUser from '../../lib/user'

export default function ProfileModal ({ isActive, handleClose }: ModalProps) {
  const [user] = useUser()
  const [bio, setBio] = useState('')
  const [image, setImage] = useState('')

  const handleSubmit = async () => {
    if (user == null) return

    await request({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: { bio, image }
    })
    handleClose()
  }

  return (
    <Modal isActive={isActive} handleClose={handleClose}>
        <h1 className='title'>Profile</h1>

        <Form onSubmit={handleSubmit}>
            <TextField title='Bio' name='bio' type='text' value={bio} onChange={e => setBio(e.target.value)} />
            <TextField title='Image URL' name='image' type='url' value={image} onChange={e => setImage(e.target.value)} />
            <Button title='Save' className='mt-4' />
        </Form>
    </Modal>
  )
}
