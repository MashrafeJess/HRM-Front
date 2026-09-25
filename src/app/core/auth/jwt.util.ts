export function decodeJwt(token: string): Record<string, unknown> | null {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// A token can still be sitting in localStorage — and the isLoggedIn signal can still
// read true — well after its `exp` has passed, since nothing re-checks the clock until
// an actual HTTP call 401s. Navigating with the browser's Back/Forward buttons makes no
// HTTP call, so route guards must check real expiry themselves, not just token presence.
export function isTokenExpired(token: string): boolean {
  const claims = decodeJwt(token);
  const exp = claims?.['exp'];
  if (typeof exp !== 'number') return true;
  return Date.now() >= exp * 1000;
}
