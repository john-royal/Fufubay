import { useState } from 'react'
import { Button, Form } from '../common/form'

export default function Search ({ onSubmit }: { onSubmit: (query: string) => Promise<void> }) {
  const [query, setQuery] = useState('')

  const handleSubmit = async () => {
    await onSubmit(query)
  }

  return (
    <Form onSubmit={handleSubmit}>
      <div className="field has-addons conatiner box columns is-centered field is-fullwidth">
        <div className="control">
          <input className="input is-max-widescreen" type="text" placeholder="Search item..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <Button title='Search' />
      </div>
    </Form>
  )
}
