import { useState } from 'react'
import { Button, Form, TextField } from '../common/form'
import { useModal } from '../common/modal'
import request from '../../lib/request'
import useUser from '../../lib/user'
import { User } from '../../shared/types'

export default function PhoneModal () {
  const { user } = useUser() as { user: User }
  const { handleClose } = useModal()

  const [phone, setPhone] = useState(user.phone)

  const handleSubmit = async () => {
    await request({
      method: 'PATCH',
      url: `/api/users/${user.id}`,
      body: { phone }
    })
    handleClose()
  }

  return (
    <>
      <h1 className='title'>Phone Number</h1>

      <Form onSubmit={handleSubmit}>
        <TextField title='Phone Number' name='phone' type='tel' value={phone} onChange={e => setPhone(e.target.value)} />
        <Button title='Save' className='mt-4' />
      </Form>
    </>
  )
}
