import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/format";
import { getCartView } from "@/lib/data/cart";
import { CartItemRow } from "./cart-item-row";
import { CouponForm } from "./coupon-form";

export const metadata = { title: "Carrinho" };

const SHIPPING_ESTIMATE = 19.9;

export default async function CartPage() {
  const cart = await getCartView();

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl text-foreground">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground">
          Que tal dar uma olhada nas nossas coleções e achar sua próxima camiseta favorita?
        </p>
        <Button asChild size="lg" className="mt-2 rounded-full px-8">
          <Link href="/produtos">Ver produtos</Link>
        </Button>
      </div>
    );
  }

  const shipping = SHIPPING_ESTIMATE;
  const total = Math.max(cart.subtotal - cart.discountTotal, 0) + shipping;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground">Seu carrinho</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-border">
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        <div className="flex flex-col gap-6 rounded-lg bg-surface p-6 lg:sticky lg:top-24 lg:h-fit">
          <CouponForm appliedCode={cart.couponCode} />

          <Separator />

          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-foreground">{formatMoney(cart.subtotal)}</dd>
            </div>
            {cart.discountTotal > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Desconto</dt>
                <dd className="text-primary">-{formatMoney(cart.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frete estimado</dt>
              <dd className="text-foreground">{formatMoney(shipping)}</dd>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-base font-medium">
              <dt className="text-foreground">Total</dt>
              <dd className="text-foreground">{formatMoney(total)}</dd>
            </div>
          </dl>

          <Button asChild size="lg" className="rounded-full">
            <Link href="/checkout">Finalizar compra</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Frete calculado por CEP na próxima etapa.
          </p>
        </div>
      </div>
    </div>
  );
}
