import { Request, Response, Router } from 'express'

export interface Route {
  method: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
  path: string
  handler: (req: Request, res: Response) => Promise<void>
}

export default function router (routes: Route[]): Router {
  const router = Router()

  for (const { method, path, handler } of routes) {
    router[method](path, (req, res) => {
      handler(req, res).catch(error => {
        console.error(error)

        res.status(500).json({
          success: false,
          error
        })
      })
    })
  }

  return router
}
