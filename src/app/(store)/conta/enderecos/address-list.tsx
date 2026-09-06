"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteAddressAction } from "@/lib/actions/auth";
import { AddressForm } from "./address-form";
import type { Address } from "@/generated/prisma/client";

export function AddressList({ addresses }: { addresses: Address[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-4">
        {addresses.map((address) => (
          <li key={address.id} className="rounded-lg bg-surface p-5">
            {editingId === address.id ? (
              <AddressForm address={address} onDone={() => setEditingId(null)} />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-foreground">
                  <p className="font-medium">
                    {address.label || address.recipientName}
                    {address.isDefault && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        Padrão
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {address.street}, {address.number}
                    {address.complement ? ` — ${address.complement}` : ""}
                    <br />
                    {address.neighborhood}, {address.city} - {address.state}
                    <br />
                    CEP {address.zipCode}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(address.id)}>
                    Editar
                  </Button>
                  <form action={deleteAddressAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      Excluir
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {creating ? (
        <div className="rounded-lg bg-surface p-5">
          <AddressForm onDone={() => setCreating(false)} />
        </div>
      ) : (
        <Button variant="outline" onClick={() => setCreating(true)} className="self-start rounded-full">
          Adicionar endereço
        </Button>
      )}
    </div>
  );
}
