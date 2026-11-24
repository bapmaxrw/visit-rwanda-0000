/**
 * Session signing secret, shared by the node-side auth helpers and the edge
 * middleware so the fallback rule lives in exactly one place.
 *
 * A published fallback would let anyone forge a cookie signature, which is the
 * one thing the admin gate exists to stop. It is therefore only used outside
 * production: in production a missing AUTH_SECRET returns null and each caller
 * fails loudly instead of quietly signing with a known value.
 */
export function authSecretOrNull(): string | null {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret) return secret;
  return process.env.NODE_ENV === "production" ? null : "visit-rwanda-development-secret";
}
