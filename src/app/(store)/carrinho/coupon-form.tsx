"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applyCoupon } from "@/lib/actions/cart";

export function CouponForm({ appliedCode }: { appliedCode: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex gap-2"
      action={(formData) =>
        startTransition(async () => {
          const result = await applyCoupon(formData);
          setError(result?.error ?? null);
        })
      }
    >
      <Input
        name="code"
        aria-label="Cupom de desconto"
        placeholder="Cupom de desconto"
        defaultValue={appliedCode ?? ""}
        autoComplete="off"
        spellCheck={false}
        className="bg-background"
      />
      <Button type="submit" variant="outline" disabled={pending}>
        Aplicar
      </Button>
      <p className="sr-only" role="status" aria-live="polite">
        {error ?? ""}
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
