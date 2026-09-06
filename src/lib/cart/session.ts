import "server-only";
import { cookies } from "next/headers";

export const CART_COOKIE = "nv_cart_token";

/** Read-only: safe to call from Server Components. */
export async function getCartToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

/** Mutates cookies: only callable from a Server Action or Route Handler. */
export async function ensureCartToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const token = crypto.randomUUID();
  store.set(CART_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return token;
}
