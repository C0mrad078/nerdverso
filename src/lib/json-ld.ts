/** Serializes a JSON-LD payload for a <script> tag, escaping "<" so a value
 * containing "</script>" can't break out of the tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
