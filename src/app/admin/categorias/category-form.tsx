"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NameSlugFields } from "@/components/admin/name-slug-fields";
import { StatusSelect } from "@/components/admin/status-select";
import { upsertCategoryAction } from "@/lib/actions/admin-catalog";
import type { FormState } from "@/lib/actions/auth";
import type { Category } from "@/generated/prisma/client";

const initialState: FormState = { status: "idle", message: "" };

export function CategoryForm({ category, onDone }: { category?: Category; onDone?: () => void }) {
  const action = upsertCategoryAction.bind(null, category?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <NameSlugFields defaultName={category?.name} defaultSlug={category?.slug} />

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" defaultValue={category?.description ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="image">Imagem (URL)</Label>
        <Input id="image" name="image" defaultValue={category?.image ?? ""} placeholder="/seed/..." />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="banner">Banner (URL)</Label>
        <Input id="banner" name="banner" defaultValue={category?.banner ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="position">Posição</Label>
        <Input id="position" name="position" type="number" min={0} defaultValue={category?.position ?? 0} />
      </div>

      <StatusSelect defaultValue={category?.status ?? "ACTIVE"} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="seoTitle">SEO — título</Label>
        <Input id="seoTitle" name="seoTitle" defaultValue={category?.seoTitle ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="seoDescription">SEO — descrição</Label>
        <Input id="seoDescription" name="seoDescription" defaultValue={category?.seoDescription ?? ""} />
      </div>

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="rounded-full sm:col-span-2">
        {pending ? "Salvando…" : "Salvar categoria"}
      </Button>
    </form>
  );
}
