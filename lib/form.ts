import { ChangeEvent, FormEvent, useState } from 'react'
import { post } from './request'

export default function useForm<T> (url: string, initialValues: Partial<T>, handler: (result: T) => Promise<void>): Form<T> {
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState('')
  const register = <Key extends keyof T>(key: Key): Input<Partial<T>[Key]> => {
    return {
      id: key as string,
      name: key as string,
      value: values[key],
      onChange (e: ChangeEvent<HTMLInputElement>) {
        setValues({ ...values, [key]: e.target.value })
      }
    }
  }
  const submit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    setError('')

    post<Partial<T>, T>(url, values)
      .then(async response => {
        if (!response.success) throw new Error(response.error.message)
        else return await handler(response.data)
      })
      .catch(error => {
        setError(error)
      })
  }
  return { error, register, submit }
}

export interface Form<T> {
  error: string
  register: <Key extends keyof T>(name: Key) => Input<Partial<T>[Key]>
  submit: (e: FormEvent<HTMLFormElement>) => void
}

export interface Input<U> {
  id: string
  name: string
  value: U
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}
