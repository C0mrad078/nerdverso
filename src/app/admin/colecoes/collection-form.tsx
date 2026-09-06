"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NameSlugFields } from "@/components/admin/name-slug-fields";
import { StatusSelect } from "@/components/admin/status-select";
import { upsertCollectionAction } from "@/lib/actions/admin-catalog";
import type { FormState } from "@/lib/actions/auth";
import type { Collection } from "@/generated/prisma/client";

const initialState: FormState = { status: "idle", message: "" };

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function CollectionForm({
  collection,
  onDone,
}: {
  collection?: Collection;
  onDone?: () => void;
}) {
  const action = upsertCollectionAction.bind(null, collection?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <NameSlugFields defaultName={collection?.name} defaultSlug={collection?.slug} />

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" defaultValue={collection?.description ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="image">Capa (URL)</Label>
        <Input id="image" name="image" defaultValue={collection?.image ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="banner">Banner (URL)</Label>
        <Input id="banner" name="banner" defaultValue={collection?.banner ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="position">Posição</Label>
        <Input id="position" name="position" type="number" min={0} defaultValue={collection?.position ?? 0} />
      </div>

      <StatusSelect defaultValue={collection?.status ?? "ACTIVE"} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startsAt">Início da campanha</Label>
        <Input id="startsAt" name="startsAt" type="date" defaultValue={toDateInputValue(collection?.startsAt)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="endsAt">Fim da campanha</Label>
        <Input id="endsAt" name="endsAt" type="date" defaultValue={toDateInputValue(collection?.endsAt)} />
      </div>

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="rounded-full sm:col-span-2">
        {pending ? "Salvando…" : "Salvar coleção"}
      </Button>
    </form>
  );
}
