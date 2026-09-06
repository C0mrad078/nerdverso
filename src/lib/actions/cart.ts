"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getActiveCartWhere, getOrCreateCartForWrite } from "@/lib/cart/resolve";
import { Status } from "@/generated/prisma/client";

async function addVariantToCart(variantId: string, requestedQuantity: number) {
  if (!variantId) throw new Error("Selecione uma variante válida.");
  const quantity = Math.max(1, Math.floor(requestedQuantity) || 1);

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { inventory: true, product: true },
  });

  if (!variant || variant.status !== Status.ACTIVE || variant.product.status !== Status.ACTIVE) {
    throw new Error("Este produto não está disponível.");
  }

  const available = variant.inventory
    ? Math.max(variant.inventory.quantity - variant.inventory.reserved, 0)
    : 0;
  if (available < 1) throw new Error("Produto sem estoque no momento.");

  const cart = await getOrCreateCartForWrite();

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });
  const nextQuantity = Math.min((existingItem?.quantity ?? 0) + quantity, available);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: nextQuantity },
    create: {
      cartId: cart.id,
      productId: variant.productId,
      variantId,
      quantity: nextQuantity,
    },
  });

  revalidatePath("/carrinho");
  revalidatePath("/", "layout");
}

export async function addToCart(formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  await addVariantToCart(variantId, quantity);
}

export async function buyNow(formData: FormData) {
  const variantId = String(formData.get("variantId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 1);
  await addVariantToCart(variantId, quantity);
  redirect("/carrinho");
}

export async function updateCartItemQuantity(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  const quantity = Math.floor(Number(formData.get("quantity") ?? 0));
  if (!itemId) return;

  const where = await getActiveCartWhere();
  if (!where) return;

  // Scope the lookup to the caller's own cart so one visitor can't mutate
  // another visitor's cart item by guessing/reusing an itemId.
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: where },
    include: { variant: { include: { inventory: true } } },
  });
  if (!item) return;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    const available = item.variant.inventory
      ? Math.max(item.variant.inventory.quantity - item.variant.inventory.reserved, 0)
      : 0;
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: Math.min(quantity, Math.max(available, 1)) },
    });
  }

  revalidatePath("/carrinho");
  revalidatePath("/", "layout");
}

export async function removeCartItem(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) return;

  const where = await getActiveCartWhere();
  if (!where) return;

  await prisma.cartItem.deleteMany({
    where: { id: itemId, cart: where },
  });
  revalidatePath("/carrinho");
  revalidatePath("/", "layout");
}

export async function applyCoupon(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { error: "Informe um cupom." };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  const now = new Date();

  if (
    !coupon ||
    !coupon.active ||
    (coupon.startsAt && coupon.startsAt > now) ||
    (coupon.endsAt && coupon.endsAt < now)
  ) {
    return { error: "Cupom inválido ou expirado." };
  }

  const cart = await getOrCreateCartForWrite();
  await prisma.cart.update({ where: { id: cart.id }, data: { couponId: coupon.id } });

  revalidatePath("/carrinho");
  return { error: null };
}
