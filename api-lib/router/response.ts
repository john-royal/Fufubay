import { NextApiResponse } from 'next'

export default class Response {
  constructor (public readonly raw: NextApiResponse) {}

  success<T>(data: T): void {
    this.raw.status(200).json({
      success: true,
      data
    })
  }

  created<T>(data: T): void {
    this.raw.status(201).json({
      success: true,
      data
    })
  }

  badRequest (message?: string): void {
    this.raw.status(400).json({
      success: false,
      error: { error: 'Bad Request', message }
    })
  }

  unauthorized (message?: string): void {
    this.raw.status(401).json({
      success: false,
      error: { error: 'Unauthorized', message }
    })
  }

  forbidden (message?: string): void {
    this.raw.status(403).json({
      success: false,
      error: { error: 'Forbidden', message }
    })
  }

  notFound (message?: string): void {
    this.raw.status(404).json({
      success: false,
      error: { error: 'Not Found', message }
    })
  }

  methodNotAllowed (message?: string): void {
    this.raw.status(405).json({
      success: false,
      error: { error: 'Method Not Allowed', message }
    })
  }

  internalServerError (error: Error): void {
    this.raw.status(500).json({
      success: false,
      error: Object.assign({ message: error.toString() }, error)
    })
  }

  redirect (url: string): void {
    this.raw.redirect(url)
  }
}
