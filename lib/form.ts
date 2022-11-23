import { ChangeEvent, FormEvent, useState } from 'react'
import request from './request'

export default function useForm<T> (options: FormOptions, initialValues: Partial<T>, handler: (result: T) => Promise<void>): Form<T> {
  const [values, setValues] = useState(initialValues)

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
  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    const data = await request<T>({
      method: options.method,
      url: options.url,
      body: values
    })
    return await handler(data)
  }
  return { register, submit }
}

export interface FormOptions {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
}

export interface Form<T> {
  register: <Key extends keyof T>(name: Key) => Input<Partial<T>[Key]>
  submit: (e: FormEvent<HTMLFormElement>) => Promise<void>
}

export interface Input<U> {
  id: string
  name: string
  value: U
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}
