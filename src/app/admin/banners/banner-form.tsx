"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { upsertBannerAction } from "@/lib/actions/admin-catalog";
import type { FormState } from "@/lib/actions/auth";
import type { Banner } from "@/generated/prisma/client";

const initialState: FormState = { status: "idle", message: "" };

const POSITIONS = [
  { value: "home_hero", label: "Home — topo (hero)" },
  { value: "home_middle", label: "Home — meio da página" },
  { value: "category", label: "Página de categoria" },
  { value: "collection", label: "Página de coleção" },
  { value: "campaign", label: "Campanha especial" },
];

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 16);
}

export function BannerForm({ banner, onDone }: { banner?: Banner; onDone?: () => void }) {
  const action = upsertBannerAction.bind(null, banner?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="internalTitle">Título interno (só para o painel)</Label>
        <Input id="internalTitle" name="internalTitle" required defaultValue={banner?.internalTitle ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Título exibido</Label>
        <Input id="title" name="title" defaultValue={banner?.title ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subtitle">Subtítulo</Label>
        <Input id="subtitle" name="subtitle" defaultValue={banner?.subtitle ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ctaLabel">Texto do botão</Label>
        <Input id="ctaLabel" name="ctaLabel" defaultValue={banner?.ctaLabel ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ctaLink">Link do botão</Label>
        <Input id="ctaLink" name="ctaLink" placeholder="/colecao/games" defaultValue={banner?.ctaLink ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="imageDesktop">Imagem desktop (URL)</Label>
        <Input id="imageDesktop" name="imageDesktop" required defaultValue={banner?.imageDesktop ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="imageMobile">Imagem mobile (URL)</Label>
        <Input id="imageMobile" name="imageMobile" defaultValue={banner?.imageMobile ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="altText">Texto alternativo (acessibilidade)</Label>
        <Input id="altText" name="altText" defaultValue={banner?.altText ?? ""} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="position">Posição</Label>
        <Select name="position" defaultValue={banner?.position ?? "home_hero"}>
          <SelectTrigger id="position" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POSITIONS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="order">Ordem</Label>
        <Input id="order" name="order" type="number" min={0} defaultValue={banner?.order ?? 0} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startsAt">Início da exibição</Label>
        <Input
          id="startsAt"
          name="startsAt"
          type="datetime-local"
          defaultValue={toDateInputValue(banner?.startsAt)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="endsAt">Fim da exibição</Label>
        <Input
          id="endsAt"
          name="endsAt"
          type="datetime-local"
          defaultValue={toDateInputValue(banner?.endsAt)}
        />
      </div>

      <label className="flex items-center gap-2 sm:col-span-2">
        <Switch name="active" defaultChecked={banner?.active ?? true} />
        <span className="text-sm text-foreground">Banner ativo</span>
      </label>

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive sm:col-span-2">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="rounded-full sm:col-span-2">
        {pending ? "Salvando…" : "Salvar banner"}
      </Button>
    </form>
  );
}
