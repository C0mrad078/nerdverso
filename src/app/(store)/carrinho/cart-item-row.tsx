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
        className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-md bg-surface sm:w-24"
      >
        {item.image && (
          <Image src={item.image} alt={item.productName} fill className="object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/produto/${item.productSlug}`}
              className="font-display text-base text-foreground hover:text-primary"
            >
              {item.productName}
            </Link>
            {item.variantLabel && (
              <p className="text-sm text-muted-foreground">{item.variantLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={remove}
            aria-label="Remover item"
            className="text-muted-foreground hover:text-foreground"
            disabled={pending}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center rounded-full border border-border">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              className="flex size-8 items-center justify-center disabled:opacity-40"
              disabled={pending || item.quantity <= 1}
              onClick={() => changeQuantity(item.quantity - 1)}
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              className="flex size-8 items-center justify-center disabled:opacity-40"
              disabled={pending || item.quantity >= item.available}
              onClick={() => changeQuantity(item.quantity + 1)}
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <span className="font-medium text-foreground">{formatMoney(item.lineTotal)}</span>
        </div>
      </div>
    </div>
  );
}
