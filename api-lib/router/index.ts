import { withIronSessionApiRoute } from 'iron-session/next'
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { sessionOptions } from 'session.config'
import Request from './request'
import Response from './response'
import Route from './route'

type AnyRoute = Route<any, any>

export { Request, Response, Route }

export class Router {
  constructor (private readonly routes: AnyRoute[]) {}

  async handle (req: NextApiRequest, res: NextApiResponse): Promise<any> {
    const route = this.routes.find(route => route.isMatch(req.method as string))
    if (route == null) {
      return new Response(res).methodNotAllowed()
    }
    return withIronSessionApiRoute(async (req, res) => {
      await route.handle(req, res)
    }, sessionOptions)(req, res)
  }

  static for (routes: AnyRoute | AnyRoute[]): NextApiHandler {
    const router = new Router(Array.isArray(routes) ? routes : [routes])
    return router.handle.bind(router)
  }
}
