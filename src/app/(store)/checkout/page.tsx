import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { getCartView } from "@/lib/data/cart";
import { getStoreSetting } from "@/lib/data/storefront";
import { estimateShipping } from "@/lib/shipping";
import { redirect } from "next/navigation";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [cart, settings] = await Promise.all([getCartView(), getStoreSetting()]);
  if (cart.items.length === 0) redirect("/carrinho");

  const freeShippingThreshold = settings?.freeShippingThreshold
    ? Number(settings.freeShippingThreshold)
    : null;
  const shipping = estimateShipping(cart.subtotal, freeShippingThreshold);
  const total = Math.max(cart.subtotal - cart.discountTotal, 0) + shipping;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground">Finalizar compra</h1>

      <div className="mt-6 rounded-lg border border-dashed border-border bg-surface p-6">
        <p className="text-sm text-foreground">
          O checkout de identificação, endereço, frete e pagamento (Pix, cartão e boleto)
          está na próxima etapa de implementação. O resumo abaixo já reflete os itens reais
          do seu carrinho.
        </p>
      </div>

      <dl className="mt-6 flex flex-col gap-2 text-sm">
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
          <dd className="tabular-nums text-foreground">
            {shipping === 0 ? "Grátis" : formatMoney(shipping)}
          </dd>
        </div>
        <div className="flex justify-between text-base font-medium">
          <dt className="text-foreground">Total</dt>
          <dd className="tabular-nums text-foreground">{formatMoney(total)}</dd>
        </div>
      </dl>

      <Button asChild variant="outline" className="mt-8 rounded-full">
        <Link href="/carrinho">Voltar ao carrinho</Link>
      </Button>
    </div>
  );
}
