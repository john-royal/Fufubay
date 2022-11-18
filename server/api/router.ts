import { RequestHandler, Request, Response, Router } from 'express'
import helpers from '../helpers'
import '..'

export interface Route {
  method: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
  path: string
  handler: (req: Request, res: Response) => Promise<Response>
}

export default function router (routes: Route[]): Router {
  const router = Router()

  router.use(helpers as RequestHandler)

  for (const { method, path, handler } of routes) {
    router[method](path, (req, res) => {
      handler(req, res).catch(error => {
        console.error(error)

        res.internalServerError(error)
      })
    })
  }

  return router
}
