Authentication Implementation — WebAuthn, TOTP, Password, Session Management

Overview
This implementation provides a comprehensive auth stack with multiple methods:
- Password (bcrypt hash)
- WebAuthn / Passkeys (biometric, security key)
- TOTP 2FA (authenticator app)
- JWT with refresh tokens
- HTTP-only secure cookies
- Automatic token refresh via middleware

Key Files

Backend Libs
- `lib/prisma.ts` — Prisma client singleton
- `lib/jwt.ts` — access/refresh token signing & verification
- `lib/auth.ts` — password hashing, user creation, cookie helpers
- `lib/webauthn.ts` — WebAuthn registration/authentication helpers
- `lib/totp.ts` — TOTP secret generation and verification

API Routes
- `/api/auth/register` — create user with password
- `/api/auth/login` — password-based login, set cookies
- `/api/auth/logout` — clear auth cookies
- `/api/auth/session` — verify current session
- `/api/auth/webauthn/register-options` — generate registration challenge
- `/api/auth/webauthn/register` — verify attestation & store credential
- `/api/auth/webauthn/authenticate-options` — generate assertion challenge
- `/api/auth/webauthn/authenticate` — verify assertion & set cookies
- `/api/auth/totp/setup` — generate TOTP secret
- `/api/auth/totp/verify` — enable TOTP after verification
- `/api/auth/totp/disable` — disable TOTP

Frontend Pages
- `/auth/register` — registration form
- `/auth/login` — login form
- `/auth/totp` — TOTP setup & verification
- `/auth/passkey/register` — WebAuthn registration
- `/auth/passkey/authenticate` — WebAuthn authentication

Middleware
- `middleware.ts` — protects routes, verifies tokens, refreshes access tokens

Flow: Register with Password & WebAuthn
1. User visits `/auth/register`, submits email & password
2. Backend hashes password, creates user in DB
3. User visits `/auth/passkey/register` with user ID
4. Frontend calls `/api/auth/webauthn/register-options` → browser prompts biometric
5. Frontend submits attestation to `/api/auth/webauthn/register`
6. Backend stores credential, user now has passkey

Flow: Login with Passkey
1. User visits `/auth/passkey/authenticate`
2. User enters user ID
3. Frontend calls `/api/auth/webauthn/authenticate-options` → browser prompts biometric
4. Frontend submits assertion to `/api/auth/webauthn/authenticate`
5. Backend verifies assertion, sets access/refresh cookies
6. Middleware auto-refreshes access token before expiry

Flow: TOTP Setup
1. User visits `/auth/totp` with user ID
2. Frontend calls `/api/auth/totp/setup`
3. Backend generates secret, returns QR code URL (otpauth_url) and base32
4. User scans QR in authenticator app
5. User enters 6-digit code
6. Frontend calls `/api/auth/totp/verify` with token
7. Backend enables TOTP on user record

DB Schema
- User: `email`, `passwordHash`, `totpSecret`, `totpEnabled`, `webauthnKeys[]`
- WebAuthnKey: `credentialID`, `publicKey`, `counter`, `transports`

Security Considerations
- Passwords hashed with bcrypt (10 salt rounds)
- Tokens use JWT with 15m access / 7d refresh expiry
- Cookies: HttpOnly, Secure (in prod), SameSite=lax
- Challenge storage (in-memory for dev) should use Redis/DB in production
- Counter validation on WebAuthn assertions to prevent cloning
- TOTP window tolerance of ±1 to account for clock skew

Notes & Next Steps
- Add device management (track devices per session)
- Add rate limiting on login/auth endpoints
- Add email verification for registration
- Add password reset flow
- Move challenge store from memory to Redis
- Add OAuth2 / social login flows if needed
