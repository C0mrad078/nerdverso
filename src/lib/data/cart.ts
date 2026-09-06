import { prisma } from "@/lib/db/client";
import { getActiveCartWhere } from "@/lib/cart/resolve";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function getCurrentCart() {
  const where = await getActiveCartWhere();
  if (!where) return null;

  return prisma.cart.findFirst({
    where,
    include: {
      coupon: true,
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          product: {
            include: { images: { orderBy: { position: "asc" }, take: 1 } },
          },
          variant: {
            include: {
              inventory: true,
              values: { include: { attributeValue: true } },
            },
          },
        },
      },
    },
  });
}

export type CartViewItem = {
  id: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  available: number;
  lineTotal: number;
};

export type CartView = {
  items: CartViewItem[];
  subtotal: number;
  discountTotal: number;
  couponCode: string | null;
};

export async function getCartView(): Promise<CartView> {
  const cart = await getCurrentCart();
  if (!cart) return { items: [], subtotal: 0, discountTotal: 0, couponCode: null };

  const items: CartViewItem[] = cart.items.map((item) => {
    const unitPrice = toNumber(item.variant.price ?? item.product.price);
    const available = item.variant.inventory
      ? Math.max(item.variant.inventory.quantity - item.variant.inventory.reserved, 0)
      : 0;
    return {
      id: item.id,
      productSlug: item.product.slug,
      productName: item.product.name,
      variantId: item.variantId,
      variantLabel: item.variant.values.map((v) => v.attributeValue.value).join(" / "),
      image: item.product.images[0]?.url ?? null,
      quantity: item.quantity,
      unitPrice,
      available,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const now = new Date();
  const couponIsValid =
    !!cart.coupon &&
    cart.coupon.active &&
    (!cart.coupon.startsAt || cart.coupon.startsAt <= now) &&
    (!cart.coupon.endsAt || cart.coupon.endsAt >= now);

  let discountTotal = 0;
  if (couponIsValid && cart.coupon) {
    if (cart.coupon.discountType === "PERCENTAGE") {
      discountTotal = subtotal * (toNumber(cart.coupon.discountValue) / 100);
    } else if (cart.coupon.discountType === "FIXED") {
      discountTotal = Math.min(toNumber(cart.coupon.discountValue), subtotal);
    }
  }

  return {
    items,
    subtotal,
    discountTotal,
    couponCode: couponIsValid ? (cart.coupon?.code ?? null) : null,
  };
}

export async function getCartItemCount(): Promise<number> {
  const cart = await getCurrentCart();
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
