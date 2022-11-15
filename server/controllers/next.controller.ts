import next from 'next'
import { parse } from 'url' // eslint-disable-line n/no-deprecated-api
import { Request, Response, NextFunction, RequestHandler } from 'express'

export default async function nextController (): Promise<RequestHandler> {
  const app = next({ dev: process.env.NODE_ENV !== 'production' })
  const handler = app.getRequestHandler()

  await app.prepare()

  return function handle (req: Request, res: Response, next: NextFunction): void {
    const url = parse(req.url, true)
    handler(req, res, url)
      .then(() => next())
      .catch(err => next(err))
  }
}
