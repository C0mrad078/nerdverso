"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertAddressAction, type FormState } from "@/lib/actions/auth";
import type { Address } from "@/generated/prisma/client";

const initialState: FormState = { status: "idle", message: "" };

export function AddressForm({
  address,
  onDone,
}: {
  address?: Address;
  onDone?: () => void;
}) {
  const action = upsertAddressAction.bind(null, address?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="label">Nome do endereço (opcional)</Label>
        <Input id="label" name="label" placeholder="Casa, trabalho…" defaultValue={address?.label ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="recipientName">Destinatário</Label>
        <Input
          id="recipientName"
          name="recipientName"
          required
          autoComplete="name"
          defaultValue={address?.recipientName ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={address?.phone ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="zipCode">CEP</Label>
        <Input
          id="zipCode"
          name="zipCode"
          required
          inputMode="numeric"
          autoComplete="postal-code"
          defaultValue={address?.zipCode ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="street">Rua</Label>
        <Input
          id="street"
          name="street"
          required
          autoComplete="address-line1"
          defaultValue={address?.street ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="number">Número</Label>
        <Input id="number" name="number" required defaultValue={address?.number ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="complement">Complemento</Label>
        <Input id="complement" name="complement" defaultValue={address?.complement ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="neighborhood">Bairro</Label>
        <Input id="neighborhood" name="neighborhood" required defaultValue={address?.neighborhood ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">Cidade</Label>
        <Input
          id="city"
          name="city"
          required
          autoComplete="address-level2"
          defaultValue={address?.city ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="state">Estado (UF)</Label>
        <Input
          id="state"
          name="state"
          required
          maxLength={2}
          autoComplete="address-level1"
          defaultValue={address?.state ?? ""}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault ?? false}
          className="size-4 rounded border-border"
        />
        Definir como endereço padrão
      </label>

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="rounded-full sm:col-span-2">
        {pending ? "Salvando…" : "Salvar endereço"}
      </Button>
    </form>
  );
}
