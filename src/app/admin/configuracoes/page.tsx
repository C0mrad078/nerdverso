import { requirePermission } from "@/lib/auth/authorize";
import { prisma } from "@/lib/db/client";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Configurações" };

export default async function AdminSettingsPage() {
  await requirePermission("settings.view");

  const settings = await prisma.storeSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dados da loja, contato, redes sociais, frete e SEO.
        </p>
      </div>
      <SettingsForm
        settings={{
          ...settings,
          freeShippingThreshold: settings.freeShippingThreshold
            ? Number(settings.freeShippingThreshold)
            : null,
        }}
      />
    </div>
  );
}
