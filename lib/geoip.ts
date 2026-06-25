// Best-effort IP geolocation using ip-api.com's free, no-key JSON endpoint.
// Returns null (rendered as "—") rather than a guessed location when the IP
// is private/local or the lookup fails — never fabricate a location.
const PRIVATE_IP = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc00:|fe80:)/

export async function lookupLocation(ip: string | null | undefined): Promise<string | null> {
  if (!ip || PRIVATE_IP.test(ip)) return null
  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,country`, {
      signal: AbortSignal.timeout(2500)
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 'success') return null
    return [data.city, data.country].filter(Boolean).join(', ') || null
  } catch {
    return null
  }
}

export async function lookupLocations(ips: (string | null | undefined)[]): Promise<Record<string, string | null>> {
  const unique = Array.from(new Set(ips.filter((ip): ip is string => !!ip)))
  const results = await Promise.all(unique.map((ip) => lookupLocation(ip)))
  return Object.fromEntries(unique.map((ip, i) => [ip, results[i]]))
}
