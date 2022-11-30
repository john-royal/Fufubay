import { useState } from 'react'
import { Button, Form, ImageField, TextField } from '../common/form'
import { uploadImage } from '../../lib/images'
import request from '../../lib/request'
import useUser from '../../lib/user'
import { User } from '../../shared/types'
import { useModal } from '../common/modal'

export default function ProfileModal () {
  const { user } = useUser() as { user: User }
  const { handleClose } = useModal()

  const [username, setUsername] = useState(user.username)
  const [bio, setBio] = useState(user.bio)
  const [image, setImage] = useState<File | null>(null)

  const handleSubmit = async () => {
    await request({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: { username, bio }
    })
    if (image != null) {
      await uploadImage(`/api/users/${user.id}/image`, image)
    }
    handleClose()
  }

  return (
    <>
        <h1 className='title'>Profile</h1>

        <Form onSubmit={handleSubmit}>
            <TextField title='Username' name='username' type='text' value={username} onChange={e => setUsername(e.target.value)} />
            <TextField title='Bio' name='bio' type='text' value={bio} onChange={e => setBio(e.target.value)} />
            <ImageField onImageChange={setImage} />
            <Button title='Save' className='mt-4' />
        </Form>
    </>
  )
}