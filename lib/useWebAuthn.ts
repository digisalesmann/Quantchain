'use client'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types'

export async function registerPasskey(userId: string) {
  try {
    // Step 1: Get registration options from server
    const optionsRes = await fetch('/api/auth/webauthn/register-options', {
      method: 'POST',
      body: JSON.stringify({ userId })
    })
    const options = await optionsRes.json()

    // Step 2: Start registration (browser prompts user for biometric/security key)
    const attestationResponse = (await startRegistration(options)) as RegistrationResponseJSON

    // Step 3: Verify registration on server
    const verifyRes = await fetch('/api/auth/webauthn/register', {
      method: 'POST',
      body: JSON.stringify({ userId, credential: attestationResponse })
    })
    const result = await verifyRes.json()
    return result.ok ? { ok: true } : { ok: false, error: result.error }
  } catch (error: any) {
    return { ok: false, error: error.message }
  }
}

export async function authenticateWithPasskey(email: string) {
  try {
    // Step 1: Get authentication options from server
    const optionsRes = await fetch('/api/auth/webauthn/authenticate-options', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
    const optionsBody = await optionsRes.json()
    if (!optionsRes.ok) return { ok: false, error: optionsBody.error }

    const { options, userId } = optionsBody

    // Step 2: Start authentication (browser prompts user)
    const assertionResponse = (await startAuthentication(options)) as AuthenticationResponseJSON

    // Step 3: Verify authentication on server (sets cookies)
    const verifyRes = await fetch('/api/auth/webauthn/authenticate', {
      method: 'POST',
      body: JSON.stringify({ userId, credential: assertionResponse })
    })
    const result = await verifyRes.json()
    return result.ok ? { ok: true } : { ok: false, error: result.error }
  } catch (error: any) {
    return { ok: false, error: error.message }
  }
}
