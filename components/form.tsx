import { createContext, FormEvent, PropsWithChildren, useContext, useState } from 'react'

const ButtonContext = createContext(false)

export interface FormProps extends PropsWithChildren {
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}

export function Form ({ children, onSubmit }: FormProps) {
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ErrorNotification = () => {
    if (error == null) return <></>
    return (
        <div className='notification is-danger'>
            <strong>{error}</strong> Please try again.
        </div>
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setWorking(true)

    onSubmit(event)
      .catch(error => setError(error.toString()))
      .finally(() => setWorking(false))
  }

  return (
    <div className="form">
        <ErrorNotification />
        <form onSubmit={handleSubmit}>
        <ButtonContext.Provider value={working}>
            {children}
        </ButtonContext.Provider>
        </form>
    </div>
  )
}

export function Button ({ title, className }: { title: string, className?: string }) {
  const working = useContext(ButtonContext)

  return (
    <button className={`button is-primary ${working ? 'is-loading' : ''} ${className ?? ''}`}>
        {title}
    </button>
  )
}
