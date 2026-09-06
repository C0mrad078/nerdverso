"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth/config";
import { getCurrentCart } from "@/lib/data/cart";
import { paymentProvider } from "@/lib/payments/provider";
import { getAttributedPartner } from "@/lib/partners/attribution";
import { InventoryMovementType, OrderStatus, PaymentMethod } from "@/generated/prisma/client";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

function generateOrderNumber(): string {
  return `NV${Date.now().toString(36).toUpperCase()}${randomBytes(1).toString("hex").toUpperCase()}`;
}

export type PlaceOrderResult = { error: string } | { orderId: string };

export async function placeOrderAction(formData: FormData): Promise<PlaceOrderResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Faça login para finalizar a compra." };
  const userId = session.user.id;

  const addressId = String(formData.get("addressId") ?? "");
  const shippingRateId = String(formData.get("shippingRateId") ?? "");
  const paymentMethod = String(formData.get("paymentMethod") ?? "");

  if (!addressId || !shippingRateId || !paymentMethod) {
    return { error: "Preencha endereço, frete e forma de pagamento." };
  }
  if (!Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)) {
    return { error: "Forma de pagamento inválida." };
  }

  const [address, shippingRate, cart] = await Promise.all([
    prisma.address.findFirst({ where: { id: addressId, userId } }),
    prisma.shippingRate.findFirst({ where: { id: shippingRateId, active: true } }),
    getCurrentCart(),
  ]);

  if (!address) return { error: "Endereço inválido." };
  if (!shippingRate) return { error: "Opção de frete inválida." };
  if (!cart || cart.items.length === 0) return { error: "Seu carrinho está vazio." };

  // Re-validate stock server-side for every item — never trust what the cart
  // page displayed a minute ago.
  for (const item of cart.items) {
    const available = item.variant.inventory
      ? item.variant.inventory.quantity - item.variant.inventory.reserved
      : 0;
    if (item.quantity > available) {
      return {
        error: `"${item.product.name}" não tem mais estoque suficiente. Ajuste o carrinho.`,
      };
    }
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const unitPrice = toNumber(item.variant.price ?? item.product.price);
    return sum + unitPrice * item.quantity;
  }, 0);

  const settings = await prisma.storeSetting.findUnique({ where: { id: "singleton" } });
  const freeShippingThreshold = settings?.freeShippingThreshold
    ? toNumber(settings.freeShippingThreshold)
    : null;
  const isStandardShipping = shippingRate.id === "shipping-standard-br";
  const shippingTotal =
    isStandardShipping && freeShippingThreshold !== null && subtotal >= freeShippingThreshold
      ? 0
      : toNumber(shippingRate.price);

  let discountTotal = 0;
  const now = new Date();
  const couponValid =
    cart.coupon &&
    cart.coupon.active &&
    (!cart.coupon.startsAt || cart.coupon.startsAt <= now) &&
    (!cart.coupon.endsAt || cart.coupon.endsAt >= now);
  if (couponValid && cart.coupon) {
    if (cart.coupon.discountType === "PERCENTAGE") {
      discountTotal = subtotal * (toNumber(cart.coupon.discountValue) / 100);
    } else if (cart.coupon.discountType === "FIXED") {
      discountTotal = Math.min(toNumber(cart.coupon.discountValue), subtotal);
    }
  }

  const total = Math.max(subtotal - discountTotal, 0) + shippingTotal;
  const attributedPartner = await getAttributedPartner();
  const orderNumber = generateOrderNumber();
  const intent = await paymentProvider.createIntent({
    method: paymentMethod as PaymentMethod,
    amount: total,
    orderNumber,
  });

  const orderId = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        number: orderNumber,
        userId,
        status: OrderStatus.AWAITING_PAYMENT,
        subtotal,
        discountTotal,
        shippingTotal,
        total,
        couponId: couponValid ? cart.couponId : null,
        partnerId: attributedPartner?.id ?? null,
        shippingAddressId: address.id,
        billingAddressId: address.id,
        shippingMethod: shippingRate.name,
      },
    });

    for (const item of cart.items) {
      const unitPrice = toNumber(item.variant.price ?? item.product.price);
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          variantLabel: item.variant.values.map((v) => v.attributeValue.value).join(" / "),
          sku: item.variant.sku,
          unitPrice,
          quantity: item.quantity,
          total: unitPrice * item.quantity,
          imageUrl: item.product.images[0]?.url ?? null,
        },
      });

      if (item.variant.inventory) {
        await tx.inventory.update({
          where: { id: item.variant.inventory.id },
          data: { quantity: { decrement: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            inventoryId: item.variant.inventory.id,
            type: InventoryMovementType.OUT,
            quantity: -item.quantity,
            reason: `Pedido ${orderNumber}`,
            referenceType: "order",
            referenceId: order.id,
          },
        });
      }
    }

    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: OrderStatus.AWAITING_PAYMENT, note: "Pedido criado." },
    });

    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: intent.provider,
        method: paymentMethod as PaymentMethod,
        status: "PENDING",
        amount: total,
        externalId: intent.externalId,
      },
    });

    if (couponValid && cart.couponId) {
      const customer = await tx.customer.findUniqueOrThrow({ where: { userId } });
      await tx.couponUsage.create({
        data: {
          couponId: cart.couponId,
          customerId: customer.id,
          orderId: order.id,
          discountAmount: discountTotal,
        },
      });
    }

    if (attributedPartner) {
      const customer = await tx.customer.findUniqueOrThrow({ where: { userId } });
      await tx.partnerConversion.create({
        data: {
          partnerId: attributedPartner.id,
          orderId: order.id,
          customerId: customer.id,
          commissionAmount: total * (toNumber(attributedPartner.commissionPercent) / 100),
        },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({ where: { id: cart.id }, data: { status: "CONVERTED", couponId: null } });

    return order.id;
  });

  revalidatePath("/carrinho");
  revalidatePath("/conta/pedidos");
  redirect(`/pedido/${orderId}`);
}
