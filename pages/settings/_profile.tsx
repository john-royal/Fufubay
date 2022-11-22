import { useState } from 'react'
import { Button, Form } from '../../components/form'
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
            <div className='field'>
                <label htmlFor='bio' className='label'>Bio</label>
                <div className='control'>
                    <input type='text' name='bio' className='input' placeholder='Bio' value={bio} onChange={e => setBio(e.target.value)} />
                </div>
            </div>
            <div className='field'>
                <label htmlFor='image' className='label'>Image URL</label>
                <div className='control'>
                    <input type='text' name='image' className='input' placeholder='Image URL' value={image} onChange={e => setImage(e.target.value)} />
                </div>
            </div>
            <Button title='Save' className='mt-4' />
        </Form>
    </Modal>
  )
}
