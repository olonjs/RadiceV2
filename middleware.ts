export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

const COOKIE_NAME = '__olonjs_admin_session';
const COOKIE_MAX_AGE = 3600;
const JWT_MAX_AGE_SECONDS = 45;

function base64urlToBase64(str: string): string {
  return str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4);
}

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Handle both actual newlines and literal \n sequences (common in Vercel env vars)
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '');
  return base64ToArrayBuffer(b64);
}

async function importPublicKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(pem),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );
}

interface JwtPayload {
  sub?: string;
  iat?: number;
  exp?: number;
}

async function verifyAdminJwt(
  token: string,
  publicKey: CryptoKey,
  options: { checkExp: boolean } = { checkExp: true },
): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, signatureB64] = parts;

    const payload = JSON.parse(atob(base64urlToBase64(payloadB64))) as JwtPayload;
    if (payload.sub !== 'admin-access') return false;

    if (options.checkExp) {
      const now = Math.floor(Date.now() / 1000);
      if (typeof payload.exp !== 'number' || payload.exp < now) return false;
      if (typeof payload.iat !== 'number' || now - payload.iat > JWT_MAX_AGE_SECONDS) return false;
    }

    const message = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = base64ToArrayBuffer(base64urlToBase64(signatureB64));
    return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, publicKey, signature, message);
  } catch {
    return false;
  }
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k.trim(), decodeURIComponent(v.join('='))];
    }),
  );
}

function deny(hint: string): Response {
  console.error(`[admin-middleware] 401 reason: ${hint}`);
  return new Response('Unauthorized', { status: 401 });
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  if (!process.env.VERCEL_ENV) return undefined;

  const publicKeyPem = process.env.ADMIN_PUBLIC_KEY;
  if (!publicKeyPem) return deny('missing_public_key');

  let publicKey: CryptoKey;
  try {
    publicKey = await importPublicKey(publicKeyPem);
  } catch (e) {
    return deny(`key_import_failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  const url = new URL(request.url);
  const cookies = parseCookies(request.headers.get('Cookie'));

  // 1. Session cookie — signature check only; session lifetime governed by cookie Max-Age.
  //    The JWT stored in the cookie was valid at issue time; exp is intentionally skipped
  //    to allow 1h sessions without requiring the private key in the Edge Runtime.
  // parseCookies already decodes values — no extra decodeURIComponent needed here
  const sessionToken = cookies[COOKIE_NAME];
  if (sessionToken) {
    const cookieValid = await verifyAdminJwt(sessionToken, publicKey, { checkExp: false });
    console.error(`[admin-middleware] cookie check: present=${!!sessionToken} valid=${cookieValid}`);
    if (cookieValid) return undefined;
  }

  // 2. Bearer token in Authorization header — full validation including exp
  const authHeader = request.headers.get('Authorization') ?? '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (bearerToken && (await verifyAdminJwt(bearerToken, publicKey))) {
    return undefined;
  }

  // 3. Token as query param — full validation; set session cookie and redirect to clean URL
  const queryToken = url.searchParams.get('token');
  if (queryToken && (await verifyAdminJwt(queryToken, publicKey))) {
    const cleanUrl = new URL(url.toString());
    cleanUrl.searchParams.delete('token');
    return new Response(null, {
      status: 302,
      headers: {
        Location: cleanUrl.toString(),
        // SameSite=Lax required: navigation originates from a cross-site platform (app.olon.it)
        // SameSite=Strict would block the cookie in the redirect follow-up request
        'Set-Cookie': `${COOKIE_NAME}=${encodeURIComponent(queryToken)}; Path=/admin; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
      },
    });
  }

  return deny('token_invalid');
}
