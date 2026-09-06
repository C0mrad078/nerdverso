import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/config";
import { getOrderForUser } from "@/lib/data/account";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Pedido confirmado" };

export default async function OrderConfirmationPage(props: PageProps<"/pedido/[id]">) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await props.params;
  const order = await getOrderForUser(session.user.id, id);
  if (!order) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6">
      <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
      <h1 className="mt-4 font-display text-3xl text-foreground">Pedido confirmado!</h1>
      <p className="mt-2 text-muted-foreground">
        Pedido #{order.number} recebido. Acompanhe o status em Meus pedidos.
      </p>

      <div className="mt-8 w-full rounded-lg bg-surface p-6 text-left">
        <ul className="flex flex-col divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-2.5 text-sm">
              <span className="text-foreground">
                {item.productName} — {item.variantLabel} × {item.quantity}
              </span>
              <span className="tabular-nums text-muted-foreground">{formatMoney(item.total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-medium">
          <span className="text-foreground">Total</span>
          <span className="tabular-nums text-foreground">{formatMoney(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">Voltar à loja</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href={`/conta/pedidos/${order.id}`}>Ver detalhes do pedido</Link>
        </Button>
      </div>
    </div>
  );
}
