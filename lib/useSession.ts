'use client'
import useSWR from 'swr'

export type SessionUser = {
  id: string
  email: string
  role: string
  totpEnabled: boolean
  profile: { fullName: string | null } | null
}

export type SessionResponse = { authenticated: boolean; user?: SessionUser }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useSession(fallback?: SessionResponse) {
  const { data, isLoading, mutate } = useSWR<SessionResponse>('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
    fallbackData: fallback
  })

  return {
    user: data?.authenticated ? data.user ?? null : null,
    isLoading,
    mutate
  }
}
