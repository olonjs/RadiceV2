/**
 * Returns true when `href` should be handled by the client-side router
 * (React Router `<Link>`), false when it must remain a real `<a>`.
 *
 * In-app: non-empty, trimmed, starts with `/`, no scheme prefix.
 * External: http/https, mailto, tel, protocol-relative, javascript, data URIs.
 *
 * @see docs/decisions/ADR-002-spa-navigation-react-router-link.md
 */
export function isInAppPathHref(href: string | undefined | null): boolean {
  if (!href) return false;
  const h = href.trim();
  if (!h) return false;
  if (/^(https?:|mailto:|tel:|\/\/|javascript:|data:)/i.test(h)) return false;
  return h.startsWith('/');
}
