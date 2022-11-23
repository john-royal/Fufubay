import { createContext, FormEvent, HTMLInputTypeAttribute, InputHTMLAttributes, PropsWithChildren, useContext, useState } from 'react'

const ButtonContext = createContext(false)

export function Form ({ children, onSubmit }: PropsWithChildren & {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
}) {
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ErrorNotification = () => {
    if (error == null) return <></>
    return (
        <div className='notification is-danger'>
            <strong>{error.toString()}</strong> Please try again.
        </div>
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setWorking(true)

    ;(async () => {
      await onSubmit(event)
    })()
      .catch(error => setError(error))
      .finally(() => setWorking(false))
  }

  return (
    <div className='form'>
        <ErrorNotification />
        <form onSubmit={handleSubmit}>
        <ButtonContext.Provider value={working}>
            {children}
        </ButtonContext.Provider>
        </form>
    </div>
  )
}

export function TextField (props: InputHTMLAttributes<HTMLInputElement> & {
  title: string
  name: string
  type: HTMLInputTypeAttribute
}) {
  const working = useContext(ButtonContext)

  return (
    <Field title={props.title} id={props.name}>
        <input className='input' {...props} placeholder={props.placeholder ?? props.title} disabled={props.disabled ?? working}/>
    </Field>
  )
}

export function Field ({ title, id, children }: { title: string, id: string } & PropsWithChildren) {
  return (
    <div className='field'>
        <label htmlFor={id} className='label'>{title}</label>
        <div className='control'>
            {children}
        </div>
    </div>
  )
}

export function Button ({ title, className }: { title: string, className?: string }) {
  const working = useContext(ButtonContext)

  return (
    <div className='field'>
        <div className='control'>
            <button className={`button is-primary ${working ? 'is-loading' : ''} ${className ?? ''}`} disabled={working}>
                {title}
            </button>
        </div>
    </div>
  )
}
