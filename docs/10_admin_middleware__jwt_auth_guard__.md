# Chapter 10: Admin Middleware (JWT Auth Guard)

In [Chapter 9: Email Baking Pipeline](09_email_baking_pipeline_.md), we learned how RadiceV2 pre-renders branded email templates at build time so they're ready to send the moment a form is submitted. Now let's look at something equally important — but focused on *security* rather than content: **who is allowed to access the `/admin` panel in the first place?**

---

## What Problem Does This Solve?

Imagine your restaurant has a back-of-house office where staff can change the menu, update prices, and manage reservations. You wouldn't leave that office door wide open for anyone walking by to wander in. You'd put a **security guard** at the door, checking credentials before letting anyone through.

The `/admin` panel in RadiceV2 is that back-of-house office. Without protection, anyone who typed `/admin` into their browser could access the Visual Inspector and edit your site's content.

**The Admin Middleware is that security guard.**

> 💡 **Central use case:** A site owner wants to log in to the Visual Inspector at `/admin`. Their login is handled by the OlonJS Cloud, which issues a special digital "pass" (a JWT token). When they arrive at `/admin`, the security guard (the middleware) checks the pass. If it's valid, they're let in. If not, they're turned away with a `401 Unauthorized` response — before they even see the admin panel.

---

## What Is Middleware?

Before we dive into the security details, let's understand what "middleware" means.

In a normal web request, the browser asks for a page and the server sends it back. Middleware sits **in between** — it intercepts the request *before* it reaches the app, does some checks, and then either lets the request through or blocks it.

```
Browser → [Middleware checks credentials] → App (if allowed)
                        ↓
                   401 Denied (if not allowed)
```

In RadiceV2, the middleware runs on **Vercel's Edge Network** — a layer of servers distributed around the world that intercepts requests even before they reach your Next.js app. This means the check happens as close to the visitor as possible, extremely fast.

> 💡 **Analogy:** Think of it like a bouncer at a nightclub entrance. Guests are checked at the *door* — not after they've walked through the whole venue. The bouncer doesn't let anyone past until they've verified the guest list.

---

## The Two Types of Passes

The middleware accepts two kinds of valid credentials:

| Pass Type | What it is | Lifetime |
|---|---|---|
| **Bearer JWT** | A short-lived token in the `Authorization` header | ~45 seconds |
| **Session Cookie** | A longer-lived token stored as a browser cookie | ~1 hour |

Both are **JWTs** (JSON Web Tokens) — a standard format for digitally signed credentials. Let's understand each one.

### The Bearer JWT (Fresh Login)

When you log in via the OlonJS Cloud, it issues a short-lived JWT — valid for only 45 seconds. Your browser sends it in the `Authorization` header like this:

```
Authorization: Bearer eyJhbGciOiJFUzI1NiJ9...
```

This token is checked with **full validation** — including whether it has expired.

### The Session Cookie (Returning Visit)

Once the first valid Bearer JWT is accepted, the middleware sets a browser cookie containing the same JWT. On every subsequent request to `/admin`, the browser automatically sends this cookie.

The cookie is checked with **signature-only validation** — the expiry is skipped, because the cookie's own `Max-Age` (1 hour) handles session lifetime.

> 💡 **Analogy:** The Bearer JWT is like a one-time entry ticket — it's only valid for a few minutes after the OlonJS Cloud prints it. The session cookie is like a wristband you get at the door — it proves you were already checked in, and it's valid for the whole evening.

---

## Key Concept: The ECDSA Public Key

Both types of tokens are verified using **cryptography** — specifically a technique called **ECDSA P-256** (a type of digital signature).

Here's the key idea: the OlonJS Cloud holds a **private key** (a secret) that it uses to *sign* tokens. RadiceV2 holds a **public key** (not secret) that it uses to *verify* those signatures.

```
OlonJS Cloud:    private key → signs the JWT
RadiceV2:        public key  → verifies the JWT
```

This is like a wax seal on a letter. Only the sender (OlonJS Cloud) has the unique seal stamp (private key). Anyone can *check* whether the seal is genuine (public key), but only the original sender could have created it.

The public key is stored as an environment variable called `ADMIN_PUBLIC_KEY`. It's safe to store — it can only *verify* tokens, never create them. The private key never exists in this repository at all.

---

## The `middleware.ts` File

The entire security guard logic lives in one file: `middleware.ts`, at the root of the project.

Let's walk through it in small pieces.

### Step 1: Who Gets Checked?

```ts
// middleware.ts
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
```

This tells Vercel: "run this middleware for any request to `/admin` or anything under `/admin/`." Requests to your regular pages (`/`, `/about`, etc.) are never intercepted.

### Step 2: Loading the Public Key

```ts
// middleware.ts (simplified)
const publicKeyPem = process.env.ADMIN_PUBLIC_KEY;
if (!publicKeyPem) return deny('missing_public_key');

const publicKey = await importPublicKey(publicKeyPem);
```

The middleware reads the public key from the environment variable. If it's missing, access is immediately denied. Otherwise, it imports the key into a format the browser's built-in `crypto` API can use.

The `importPublicKey` function converts the PEM-formatted key (a text format with `-----BEGIN PUBLIC KEY-----` headers) into a `CryptoKey` object.

```ts
// middleware.ts
async function importPublicKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(pem),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );
}
```

`crypto.subtle` is the Web Cryptography API — available natively in modern browsers and Vercel's Edge Runtime. No external crypto library needed.

### Step 3: Checking the Session Cookie First

```ts
// middleware.ts (simplified)
const sessionToken = cookies[COOKIE_NAME];
if (sessionToken) {
  const valid = await verifyAdminJwt(sessionToken, publicKey, { checkExp: false });
  if (valid) return undefined; // ✅ Let them through
}
```

If a session cookie exists, it's verified (signature only, no expiry check). If valid, `return undefined` tells Vercel: "this request is fine, let it through to the app."

### Step 4: Checking the Bearer Token

```ts
// middleware.ts (simplified)
const authHeader = request.headers.get('Authorization') ?? '';
const bearerToken = authHeader.startsWith('Bearer ') 
  ? authHeader.slice(7) 
  : '';

if (bearerToken) {
  const valid = await verifyAdminJwt(bearerToken, publicKey, { checkExp: true });
  if (valid) {
    // Set a session cookie and let them through
    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, bearerToken, { maxAge: COOKIE_MAX_AGE });
    return response;
  }
}
```

If a Bearer token is present, it's verified with **full validation** (including expiry). If valid, the middleware sets the session cookie so future requests don't need a Bearer token, then lets the request through.

### Step 5: Deny Everything Else

```ts
// middleware.ts
return deny('no_valid_token');
```

If neither the cookie nor the Bearer token was valid, the request is denied with a `401 Unauthorized` response.

---

## Inside `verifyAdminJwt`: How a JWT Is Verified

A JWT has three parts separated by dots:

```
header.payload.signature
```

Here's how the verification works, step by step:

```ts
// middleware.ts (simplified)
async function verifyAdminJwt(token, publicKey, options) {
  const [headerB64, payloadB64, signatureB64] = token.split('.');

  // 1. Decode and check the payload claims
  const payload = JSON.parse(atob(base64urlToBase64(payloadB64)));
  if (payload.sub !== 'admin-access') return false;

  // 2. Check expiry (for Bearer tokens only)
  if (options.checkExp) {
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return false;
  }

  // 3. Verify the cryptographic signature
  const message = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64ToArrayBuffer(base64urlToBase64(signatureB64));
  return crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    publicKey, signature, message
  );
}
```

Three checks happen in order:

1. **Subject check** — does `payload.sub` equal `'admin-access'`? If not, this isn't an admin token.
2. **Expiry check** — for Bearer tokens, has the token expired? (Skipped for session cookies.)
3. **Signature check** — is the cryptographic signature valid? This is the core security guarantee.

> 💡 **Analogy:** Step 1 checks that the wristband says "VIP Admin." Step 2 checks that the wristband was issued today. Step 3 checks that the wristband's hologram is genuine — it can't be faked without the original stamp.

---

## The Full Flow, Visualized

Here's what happens when someone requests `/admin`:

```mermaid
sequenceDiagram
    participant BR as Browser
    participant MW as Middleware
    participant CK as Cookie Check
    participant BT as Bearer Check
    participant AP as Admin Panel

    BR->>MW: GET /admin
    MW->>CK: Session cookie present?
    CK->>MW: Valid ✅
    MW->>AP: Allow through
    AP->>BR: Admin panel HTML
```

And here's the first-time login flow (no cookie yet):

```mermaid
sequenceDiagram
    participant BR as Browser
    participant MW as Middleware
    participant BT as Bearer Check
    participant AP as Admin Panel

    BR->>MW: GET /admin + Bearer token
    MW->>BT: Verify JWT signature + expiry
    BT->>MW: Valid ✅
    MW->>BR: Set session cookie
    MW->>AP: Allow through
    AP->>BR: Admin panel HTML
```

---

## Why the Private Key Never Lives Here

You might wonder: why can't RadiceV2 just create its own tokens? The answer is the security model.

The private key (the signing key) lives **only** in the OlonJS Cloud. RadiceV2 only has the public key (the verification key). This means:

- **Only** the OlonJS Cloud can issue valid admin tokens
- Even if someone got access to the RadiceV2 source code, they couldn't forge a token
- The `ADMIN_PUBLIC_KEY` environment variable is safe to configure — it can verify but never create

> 💡 **Analogy:** RadiceV2 has a counterfeit-detection scanner (public key). Only the OlonJS Cloud has the genuine currency printing press (private key). Having the scanner doesn't let you print money.

---

## Setting It Up: The Environment Variable

To activate the middleware, you need one environment variable in your Vercel project settings:

```
ADMIN_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
-----END PUBLIC KEY-----
```

The OlonJS Cloud provides this key when you register your site. Once it's set, the middleware activates automatically on every deployment.

> ⚠️ **Important:** The middleware only runs when `process.env.VERCEL_ENV` is set — meaning it only activates on actual Vercel deployments. In local development, it steps aside and lets all requests through. This means you can develop locally without needing admin credentials.

---

## Summary

Here's what you learned in this chapter:

- **Admin Middleware** is a security guard that runs at Vercel's Edge before any `/admin` request reaches the app
- It accepts two types of credentials: a short-lived **Bearer JWT** (for fresh logins) and a longer-lived **session cookie** (for returning visits)
- Both tokens are verified using **ECDSA P-256 cryptography** with a public key stored in the `ADMIN_PUBLIC_KEY` environment variable
- The **private key never lives in this repo** — only the OlonJS Cloud can issue valid tokens
- JWT verification involves three checks: subject claim, expiry, and cryptographic signature
- The middleware only activates on Vercel deployments — local development is unaffected
- A valid Bearer JWT automatically triggers a session cookie being set, so subsequent visits don't require a new token

The Admin Middleware is the security bouncer at the back-of-house door — checking every credential carefully before anyone gets near your site's content management tools.

---

You've now completed the full RadiceV2 tutorial! You've journeyed from the very first line of code in [Chapter 1: OlonJS Engine & App Entry Point](01_olonjs_engine___app_entry_point_.md) all the way through to the security layer protecting the admin panel. You understand how content flows from JSON files through components to the screen, how themes cascade through a four-layer CSS chain, how forms submit data to the cloud, how emails are pre-rendered at build time, and finally how the admin door is kept secure.

You now have a complete mental map of RadiceV2 — from the front door to the back office. Happy building! 🌿

---

Generated by [AI Codebase Knowledge Builder](https://github.com/The-Pocket/Tutorial-Codebase-Knowledge)