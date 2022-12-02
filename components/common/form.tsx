import { ChangeEvent, createContext, FormEvent, HTMLInputTypeAttribute, InputHTMLAttributes, PropsWithChildren, useContext, useState } from 'react'

const ButtonContext = createContext(false)

export function Form ({ children, onSubmit }: PropsWithChildren & {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
}) {
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setWorking(true)

    ;(async () => {
      setError(null)
      await onSubmit(event)
    })()
      .catch(error => setError(error))
      .finally(() => setWorking(false))
  }

  return (
    <div className='form'>
        <div className={`notification is-danger${error != null ? '' : ' is-hidden'}`}>
            <strong>{error?.toString().replaceAll(/\w+:\s/g, '').replace(/\stry again.+/i, '')}</strong> Please try again.
        </div>
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

export function ImageField ({ onImageChange }: { onImageChange: (file: File | null) => void }) {
  const [imageName, setImageName] = useState('')

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.item(0)
    setImageName(image?.name ?? '')
    onImageChange(image ?? null)
  }

  return (
      <div className='file has-name is-boxed'>
        <label className='file-label'>
          <input className='file-input' accept='image' type='file' name='image' onChange={handleFileChange} />
          <span className='file-cta'>
            <span className='file-icon'>
              <i className='fas fa-upload'></i>
            </span>
            <span className='file-label'>
              Choose an image
            </span>
          </span>
          <span className='file-name'>
            {imageName}
          </span>
        </label>
      </div>
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
