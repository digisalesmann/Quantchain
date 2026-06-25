import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function POST(req: NextRequest) {
  const accessCookie = serialize('access_token', '', { httpOnly: true, path: '/', maxAge: 0 })
  const refreshCookie = serialize('refresh_token', '', { httpOnly: true, path: '/', maxAge: 0 })
  const res = NextResponse.json({ ok: true })
  res.headers.append('Set-Cookie', accessCookie)
  res.headers.append('Set-Cookie', refreshCookie)
  return res
}
