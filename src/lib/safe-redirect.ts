/** Only allow same-site relative paths as a post-auth redirect target.
 * Rejects absolute URLs and protocol-relative paths ("//evil.com") which
 * browsers resolve as an external host despite starting with "/". */
export function safeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  return path;
}
