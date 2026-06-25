import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse
} from '@simplewebauthn/server'
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  WebAuthnCredential,
  AuthenticatorTransportFuture
} from '@simplewebauthn/server'

const rpName = process.env.WEBAUTHN_RP_NAME || 'Quantchain'
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost'
const origin = process.env.WEBAUTHN_ORIGIN || `http://${rpID}:3000`

// In-memory challenge store (for demo/dev). Replace with Redis or DB for production.
const challengeStore = new Map<string, string>()

export function saveChallenge(key: string, challenge: string) {
  challengeStore.set(key, challenge)
}

export function getChallenge(key: string) {
  const c = challengeStore.get(key)
  challengeStore.delete(key)
  return c
}

type CredentialRef = { id: string; transports?: AuthenticatorTransportFuture[] }

export async function makeRegistrationOptions(user: { id: string; name: string; displayName?: string }, excludeCredentials: CredentialRef[] = []) {
  return generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.name,
    userDisplayName: user.displayName,
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials
  })
}

export async function makeAuthenticationOptions(allowCredentials: CredentialRef[] = []) {
  return generateAuthenticationOptions({
    timeout: 60000,
    rpID,
    allowCredentials
  })
}

export async function verifyRegistration(response: RegistrationResponseJSON, expectedChallenge: string) {
  return verifyRegistrationResponse({ response, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID })
}

export async function verifyAuthentication(response: AuthenticationResponseJSON, expectedChallenge: string, credential: WebAuthnCredential) {
  return verifyAuthenticationResponse({ response, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID, credential })
}
