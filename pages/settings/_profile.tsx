import { useState } from 'react'
import { Button, Form, TextField } from '../../components/form'
import Modal, { ModalProps } from '../../components/modal'
import request from '../../lib/request'
import useUser from '../../lib/user'
import { User } from '../../shared/types'

export default function ProfileModal ({ isActive, handleClose }: ModalProps) {
  const { user } = useUser() as { user: User }
  const [username, setUsername] = useState(user.username)
  const [bio, setBio] = useState(user.bio)
  const [image, setImage] = useState(user.image)

  const handleSubmit = async () => {
    await request({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: { username, bio, image }
    })
    handleClose()
  }

  return (
    <Modal isActive={isActive} handleClose={handleClose}>
        <h1 className='title'>Profile</h1>

        <Form onSubmit={handleSubmit}>
            <TextField title='Username' name='username' type='text' value={username} onChange={e => setUsername(e.target.value)} />
            <TextField title='Bio' name='bio' type='text' value={bio} onChange={e => setBio(e.target.value)} />
            <TextField title='Image URL' name='image' type='url' value={image} onChange={e => setImage(e.target.value)} />
            <Button title='Save' className='mt-4' />
        </Form>
    </Modal>
  )
}
