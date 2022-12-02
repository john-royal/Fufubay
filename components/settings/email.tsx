import { User } from '@prisma/client'
import { useState } from 'react'
import request from '../../lib/request'
import useUser from '../../lib/user'
import { Button, Form, TextField } from '../common/form'
import { useModal } from '../common/modal'

export default function EmailModal () {
  const { user } = useUser() as { user: User }
  const { handleClose } = useModal()

  const [email, setEmail] = useState(user.email)

  const handleSubmit = async () => {
    await request({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: { email }
    })
    handleClose()
  }

  return (
    <>
      <h1 className='title'>Email Address</h1>

      <Form onSubmit={handleSubmit}>
        <TextField title='Email' name='email' type='email' value={email} onChange={e => setEmail(e.target.value)} />
        <Button title='Save' className='mt-4' />
      </Form>
    </>
  )
}
