import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { serialize } from 'cookie'
import { buildGoogleAuthUrl } from '../../../../../lib/googleOAuth'

export async function GET(req: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google sign-in is not configured on this server' }, { status: 500 })
  }

  const state = randomBytes(16).toString('hex')
  const stateCookie = serialize('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 5
  })

  const res = NextResponse.redirect(buildGoogleAuthUrl(state))
  res.headers.append('Set-Cookie', stateCookie)
  return res
}
