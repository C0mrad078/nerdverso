"use client";

import { useMemo, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { addToCart, buyNow } from "@/lib/actions/cart";
import type { ProductDetailData } from "@/lib/data/storefront";

type Attribute = ProductDetailData["attributes"][number];
type Variant = ProductDetailData["variants"][number];

export function VariantSelector({
  attributes,
  variants,
  fallbackPrice,
}: {
  attributes: Attribute[];
  variants: Variant[];
  fallbackPrice: number;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const optionsByAttribute = useMemo(() => {
    const map = new Map<string, { valueId: string; value: string }[]>();
    for (const attribute of attributes) {
      const seen = new Map<string, string>();
      for (const variant of variants) {
        const match = variant.values.find((v) => v.attributeId === attribute.id);
        if (match) seen.set(match.valueId, match.value);
      }
      map.set(
        attribute.id,
        [...seen.entries()].map(([valueId, value]) => ({ valueId, value })),
      );
    }
    return map;
  }, [attributes, variants]);

  const matchedVariant = useMemo(() => {
    if (Object.keys(selected).length !== attributes.length) return null;
    return (
      variants.find((variant) =>
        variant.values.every((v) => selected[v.attributeId] === v.valueId),
      ) ?? null
    );
  }, [selected, variants, attributes.length]);

  const isComplete = Object.keys(selected).length === attributes.length;
  const available = matchedVariant?.available ?? 0;
  const canBuy = isComplete && matchedVariant !== null && available > 0;
  const price = matchedVariant?.price ?? fallbackPrice;

  function handleSelect(attributeId: string, valueId: string) {
    setSelected((prev) => ({ ...prev, [attributeId]: valueId }));
    setQuantity(1);
    setFeedback(null);
  }

  function handleSubmit(action: (formData: FormData) => Promise<unknown>) {
    return (formData: FormData) => {
      if (!matchedVariant) return;
      startTransition(async () => {
        try {
          await action(formData);
          setFeedback("Adicionado ao carrinho.");
        } catch (err) {
          setFeedback(err instanceof Error ? err.message : "Não foi possível adicionar.");
        }
      });
    };
  }

  return (
    <div className="flex flex-col gap-6">
      {attributes.map((attribute) => (
        <div key={attribute.id}>
          <span className="text-sm font-medium text-foreground">{attribute.name}</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {optionsByAttribute.get(attribute.id)?.map((option) => {
              const isSelected = selected[attribute.id] === option.valueId;
              return (
                <button
                  key={option.valueId}
                  type="button"
                  onClick={() => handleSelect(attribute.id, option.valueId)}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-4 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-foreground/40"
                  }`}
                >
                  {option.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            className="flex size-9 items-center justify-center rounded-full text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            className="flex size-9 items-center justify-center rounded-full text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40"
            disabled={!canBuy || quantity >= available}
            onClick={() => setQuantity((q) => Math.min(available || 1, q + 1))}
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>

        <span className="text-sm text-muted-foreground">
          {!isComplete
            ? "Escolha as opções"
            : available > 0
              ? available <= 5
                ? `Últimas ${available} unidades`
                : "Em estoque"
              : "Esgotado"}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <form action={handleSubmit(addToCart)} className="flex-1">
          <input type="hidden" name="variantId" value={matchedVariant?.id ?? ""} />
          <input type="hidden" name="quantity" value={quantity} />
          <Button
            type="submit"
            variant="outline"
            size="lg"
            disabled={!canBuy || pending}
            className="w-full rounded-full"
          >
            Adicionar ao carrinho
          </Button>
        </form>
        <form action={handleSubmit(buyNow)} className="flex-1">
          <input type="hidden" name="variantId" value={matchedVariant?.id ?? ""} />
          <input type="hidden" name="quantity" value={quantity} />
          <Button type="submit" size="lg" disabled={!canBuy || pending} className="w-full rounded-full">
            Comprar {formatMoney(price)}
          </Button>
        </form>
      </div>

      {feedback && (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {feedback}
        </p>
      )}
    </div>
  );
}
