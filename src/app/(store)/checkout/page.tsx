import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { getCartView } from "@/lib/data/cart";
import { getAddressesForUser } from "@/lib/data/account";
import { CheckoutForm } from "./checkout-form";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/checkout");

  const [cart, addresses, shippingRates, settings] = await Promise.all([
    getCartView(),
    getAddressesForUser(session.user.id),
    prisma.shippingRate.findMany({ where: { active: true }, orderBy: { price: "asc" } }),
    prisma.storeSetting.findUnique({ where: { id: "singleton" } }),
  ]);

  if (cart.items.length === 0) redirect("/carrinho");

  const freeShippingThreshold = settings?.freeShippingThreshold
    ? Number(settings.freeShippingThreshold)
    : null;

  if (addresses.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-display text-2xl text-foreground">Cadastre um endereço</h1>
        <p className="text-muted-foreground">
          Você precisa de ao menos um endereço de entrega para finalizar a compra.
        </p>
        <Button asChild className="rounded-full px-8">
          <Link href="/conta/enderecos">Adicionar endereço</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground">Finalizar compra</h1>
      <div className="mt-8">
        <CheckoutForm
          addresses={addresses}
          shippingOptions={shippingRates.map((r) => ({
            id: r.id,
            name: r.name,
            price: Number(r.price),
            estimatedDaysMin: r.estimatedDaysMin,
            estimatedDaysMax: r.estimatedDaysMax,
          }))}
          subtotal={cart.subtotal}
          discountTotal={cart.discountTotal}
          freeShippingThreshold={freeShippingThreshold}
        />
      </div>
    </div>
  );
}
