import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, signAccessToken } from './lib/jwt'

// Page-level auth is enforced per-route via lib/session.ts (requireSessionUserId).
// This middleware only transparently refreshes an expired access token when a
// valid refresh token is still present, so users aren't logged out every 15 minutes.
export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value

  if (!accessToken || verifyToken(accessToken)) {
    return NextResponse.next()
  }

  if (refreshToken) {
    const refreshPayload = verifyToken(refreshToken) as { sub?: string } | null
    if (refreshPayload?.sub) {
      const newAccessToken = signAccessToken({ sub: refreshPayload.sub })
      const res = NextResponse.next()
      res.cookies.set('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15
      })
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
