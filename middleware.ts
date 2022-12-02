import { UserRole } from '@prisma/client'
import { getIronSession } from 'iron-session/edge'
import { NextMiddleware, NextRequest, NextResponse } from 'next/server'
import { sessionOptions } from './common/session'

export const middleware: NextMiddleware = async function (req: NextRequest) {
  const session = await getIronSession(req, NextResponse.next(), sessionOptions)
  const { origin, pathname } = req.nextUrl
  if (session.user == null) {
    return NextResponse.redirect(`${origin}/?redirect=${pathname}`)
  } else if (pathname.startsWith('/admin') && session.user.role !== UserRole.SUPER_USER) {
    return NextResponse.redirect(`${origin}/unauthorized`)
  }
}

export const config = {
  matcher: ['/admin', '/auctions/create', '/settings']
}
