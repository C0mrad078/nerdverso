"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { placeOrderAction } from "@/lib/actions/checkout";
import type { Address } from "@/generated/prisma/client";

type ShippingOption = { id: string; name: string; price: number; estimatedDaysMin: number | null; estimatedDaysMax: number | null };

const PAYMENT_METHODS = [
  { value: "PIX", label: "Pix", helper: "Aprovação imediata (simulado neste ambiente)." },
  { value: "CREDIT_CARD", label: "Cartão de crédito", helper: "Simulado neste ambiente." },
  { value: "BOLETO", label: "Boleto", helper: "Compensação em até 3 dias úteis (simulado)." },
] as const;

export function CheckoutForm({
  addresses,
  shippingOptions,
  subtotal,
  freeShippingThreshold,
  discountTotal,
}: {
  addresses: Address[];
  shippingOptions: ShippingOption[];
  subtotal: number;
  freeShippingThreshold: number | null;
  discountTotal: number;
}) {
  const [addressId, setAddressId] = useState(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "");
  const [shippingRateId, setShippingRateId] = useState(shippingOptions[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<string>("PIX");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function effectiveShippingPrice(option: ShippingOption) {
    if (option.id === "shipping-standard-br" && freeShippingThreshold !== null && subtotal >= freeShippingThreshold) {
      return 0;
    }
    return option.price;
  }

  const shipping = shippingOptions.find((o) => o.id === shippingRateId);
  const shippingPrice = shipping ? effectiveShippingPrice(shipping) : 0;
  const total = Math.max(subtotal - discountTotal, 0) + shippingPrice;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await placeOrderAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-8">
      <input type="hidden" name="addressId" value={addressId} />
      <input type="hidden" name="shippingRateId" value={shippingRateId} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      <section>
        <h2 className="font-display text-lg text-foreground">Endereço de entrega</h2>
        <div className="mt-3 flex flex-col gap-2">
          {addresses.map((address) => (
            <label
              key={address.id}
              className={`cursor-pointer rounded-lg border p-4 text-sm ${
                addressId === address.id ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="addressChoice"
                className="sr-only"
                checked={addressId === address.id}
                onChange={() => setAddressId(address.id)}
              />
              <p className="font-medium text-foreground">{address.label || address.recipientName}</p>
              <p className="text-muted-foreground">
                {address.street}, {address.number} — {address.neighborhood}, {address.city}/{address.state}
              </p>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-foreground">Entrega</h2>
        <div className="mt-3 flex flex-col gap-2">
          {shippingOptions.map((option) => {
            const price = effectiveShippingPrice(option);
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 text-sm ${
                  shippingRateId === option.id ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <span>
                  <input
                    type="radio"
                    name="shippingChoice"
                    className="sr-only"
                    checked={shippingRateId === option.id}
                    onChange={() => setShippingRateId(option.id)}
                  />
                  <span className="font-medium text-foreground">{option.name}</span>
                  {option.estimatedDaysMin && (
                    <span className="ml-2 text-muted-foreground">
                      {option.estimatedDaysMin}–{option.estimatedDaysMax} dias úteis
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-foreground">
                  {price === 0 ? "Grátis" : formatMoney(price)}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-foreground">Pagamento</h2>
        <div className="mt-3 flex flex-col gap-2">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.value}
              className={`cursor-pointer rounded-lg border p-4 text-sm ${
                paymentMethod === method.value ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="paymentChoice"
                className="sr-only"
                checked={paymentMethod === method.value}
                onChange={() => setPaymentMethod(method.value)}
              />
              <span className="font-medium text-foreground">{method.label}</span>
              <p className="text-muted-foreground">{method.helper}</p>
            </label>
          ))}
        </div>
      </section>

      <dl className="flex flex-col gap-2 rounded-lg bg-surface p-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums text-foreground">{formatMoney(subtotal)}</dd>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Desconto</dt>
            <dd className="tabular-nums text-primary">-{formatMoney(discountTotal)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Frete</dt>
          <dd className="tabular-nums text-foreground">{shippingPrice === 0 ? "Grátis" : formatMoney(shippingPrice)}</dd>
        </div>
        <div className="flex justify-between text-base font-medium">
          <dt className="text-foreground">Total</dt>
          <dd className="tabular-nums text-foreground">{formatMoney(total)}</dd>
        </div>
      </dl>

      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending || !addressId || !shippingRateId}
        className="self-start rounded-full px-8"
      >
        {pending ? "Confirmando…" : `Confirmar pedido — ${formatMoney(total)}`}
      </Button>
    </form>
  );
}
