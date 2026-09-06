"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Minus, Plus, X } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { removeCartItem, updateCartItemQuantity } from "@/lib/actions/cart";
import type { CartViewItem } from "@/lib/data/cart";

export function CartItemRow({ item }: { item: CartViewItem }) {
  const [pending, startTransition] = useTransition();

  function changeQuantity(nextQuantity: number) {
    const formData = new FormData();
    formData.set("itemId", item.id);
    formData.set("quantity", String(nextQuantity));
    startTransition(() => updateCartItemQuantity(formData));
  }

  function remove() {
    const formData = new FormData();
    formData.set("itemId", item.id);
    startTransition(() => removeCartItem(formData));
  }

  return (
    <div className="flex gap-4 py-5">
      <Link
        href={`/produto/${item.productSlug}`}
        className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-md bg-surface outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-24"
      >
        {item.image && (
          <Image src={item.image} alt={item.productName} fill className="object-cover" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/produto/${item.productSlug}`}
              className="font-display block truncate text-base text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {item.productName}
            </Link>
            {item.variantLabel && (
              <p className="truncate text-sm text-muted-foreground">{item.variantLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={remove}
            aria-label="Remover item"
            className="shrink-0 rounded-full p-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40"
            disabled={pending}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              className="flex size-8 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40"
              disabled={pending || item.quantity <= 1}
              onClick={() => changeQuantity(item.quantity - 1)}
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>
            <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              className="flex size-8 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40"
              disabled={pending || item.quantity >= item.available}
              onClick={() => changeQuantity(item.quantity + 1)}
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <span className="shrink-0 font-medium tabular-nums text-foreground">
            {formatMoney(item.lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
