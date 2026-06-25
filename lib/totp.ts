import speakeasy from 'speakeasy'

export function generateTOTPSecret({ name, account }: { name?: string; account: string }) {
  const secret = speakeasy.generateSecret({ name: name || 'Quantchain', issuer: name || 'Quantchain', length: 20 })
  return secret
}

export function verifyTOTPToken(secret: string, token: string) {
  return speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 1 })
}
