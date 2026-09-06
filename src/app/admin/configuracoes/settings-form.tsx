"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateStoreSettingAction } from "@/lib/actions/admin-settings";
import type { FormState } from "@/lib/actions/auth";
import type { StoreSetting } from "@/generated/prisma/client";

const initialState: FormState = { status: "idle", message: "" };

export function SettingsForm({
  settings,
}: {
  settings: Omit<StoreSetting, "freeShippingThreshold"> & { freeShippingThreshold: number | null };
}) {
  const [state, formAction, pending] = useActionState(updateStoreSettingAction, initialState);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-foreground">Dados da loja</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="storeName">Nome da loja</Label>
            <Input id="storeName" name="storeName" required defaultValue={settings.storeName} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail de contato</Label>
            <Input id="email" name="email" type="email" defaultValue={settings.email ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" placeholder="5511999999999" defaultValue={settings.whatsapp ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addressLine">Endereço</Label>
            <Input id="addressLine" name="addressLine" defaultValue={settings.addressLine ?? ""} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-foreground">Redes sociais</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="instagram">Instagram (URL)</Label>
            <Input id="instagram" name="instagram" placeholder="https://instagram.com/…" defaultValue={settings.instagram ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tiktok">TikTok (URL)</Label>
            <Input id="tiktok" name="tiktok" placeholder="https://tiktok.com/…" defaultValue={settings.tiktok ?? ""} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-foreground">Frete e políticas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="freeShippingThreshold">Frete grátis a partir de (R$)</Label>
            <Input
              id="freeShippingThreshold"
              name="freeShippingThreshold"
              type="number"
              step="0.01"
              min={0}
              defaultValue={settings.freeShippingThreshold ?? ""}
            />
          </div>
          <div />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="termsUrl">Termos de uso (URL externa, opcional)</Label>
            <Input id="termsUrl" name="termsUrl" placeholder="https://…" defaultValue={settings.termsUrl ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="privacyUrl">Política de privacidade (URL externa, opcional)</Label>
            <Input id="privacyUrl" name="privacyUrl" placeholder="https://…" defaultValue={settings.privacyUrl ?? ""} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Deixe em branco para usar as páginas internas /termos e /privacidade.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg text-foreground">SEO</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seoTitle">Título padrão (SEO)</Label>
            <Input id="seoTitle" name="seoTitle" maxLength={70} defaultValue={settings.seoTitle ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seoDescription">Descrição padrão (SEO)</Label>
            <Textarea id="seoDescription" name="seoDescription" rows={3} maxLength={160} defaultValue={settings.seoDescription ?? ""} />
          </div>
        </div>
      </section>

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending ? "Salvando…" : "Salvar configurações"}
        </Button>
        {state.status === "success" && (
          <span className="text-sm text-muted-foreground">Configurações salvas.</span>
        )}
      </div>
    </form>
  );
}
