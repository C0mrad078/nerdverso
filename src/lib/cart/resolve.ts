import "server-only";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { CartStatus } from "@/generated/prisma/client";
import { ensureCartToken, getCartToken } from "@/lib/cart/session";

/** The filter that identifies "my" active cart: by account when logged in,
 * otherwise by the guest session cookie. */
export async function getActiveCartWhere() {
  const session = await auth();
  if (session?.user?.id) {
    return { userId: session.user.id, status: CartStatus.ACTIVE } as const;
  }
  const token = await getCartToken();
  if (!token) return null;
  return { sessionToken: token, status: CartStatus.ACTIVE } as const;
}

/** Returns (creating if needed) the cart that write actions should mutate. */
export async function getOrCreateCartForWrite() {
  const session = await auth();
  if (session?.user?.id) {
    const existing = await prisma.cart.findFirst({
      where: { userId: session.user.id, status: CartStatus.ACTIVE },
    });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId: session.user.id } });
  }

  const token = await ensureCartToken();
  return prisma.cart.upsert({
    where: { sessionToken: token },
    update: {},
    create: { sessionToken: token },
  });
}
