import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'cookie'
import prisma from '../../../../../lib/prisma'
import { createOAuthUser, createAuthCookies, createSession } from '../../../../../lib/auth'
import { exchangeGoogleCode, getGoogleUserInfo } from '../../../../../lib/googleOAuth'

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const expectedState = req.cookies.get('oauth_state')?.value

  const clearStateCookie = serialize('oauth_state', '', { path: '/', maxAge: 0 })

  if (!code || !state || !expectedState || state !== expectedState) {
    const res = NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`)
    res.headers.append('Set-Cookie', clearStateCookie)
    return res
  }

  try {
    const tokens = await exchangeGoogleCode(code)
    const profile = await getGoogleUserInfo(tokens.access_token)

    if (!profile.email || !profile.email_verified) {
      const res = NextResponse.redirect(`${origin}/auth/login?error=oauth_email_unverified`)
      res.headers.append('Set-Cookie', clearStateCookie)
      return res
    }

    let user = await prisma.user.findUnique({ where: { googleId: profile.sub } })
    let isNewUser = false

    if (!user) {
      const existingByEmail = await prisma.user.findUnique({ where: { email: profile.email } })
      if (existingByEmail) {
        user = await prisma.user.update({ where: { id: existingByEmail.id }, data: { googleId: profile.sub } })
      } else {
        user = await createOAuthUser(profile.email, profile.sub)
        isNewUser = true
      }
    }

    const [accessCookie, refreshCookie] = createAuthCookies(user.id)
    await createSession(user.id, { ip: req.headers.get('x-forwarded-for') ?? undefined, userAgent: req.headers.get('user-agent') ?? undefined })

    const res = NextResponse.redirect(`${origin}${isNewUser ? '/onboarding' : '/'}`)
    res.headers.append('Set-Cookie', clearStateCookie)
    res.headers.append('Set-Cookie', accessCookie)
    res.headers.append('Set-Cookie', refreshCookie)
    return res
  } catch {
    const res = NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`)
    res.headers.append('Set-Cookie', clearStateCookie)
    return res
  }
}
