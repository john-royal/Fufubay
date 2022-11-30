import { NextFunction, Request, RequestHandler, Response, Router } from 'express'

export interface Route {
  method: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
  path: string
  handler: (req: Request, res: Response) => Promise<Response>
}

export default function router (routes: Route[]): Router {
  const router = Router()

  for (const { method, path, handler } of routes) {
    router[method](path, (req, res, next) => {
      handler(req, res).catch(err => next(err))
    })
  }

  return router
}

type Handler = (req: Request, res: Response, next: NextFunction) => Response | Promise<Response> | Promise<void>

export function withHandler (handler: Handler): RequestHandler {
  return (req, res, next) => {
    (async () => {
      await handler.call({}, req, res, next)
    })()
      .catch(err => next(err))
  }
}
