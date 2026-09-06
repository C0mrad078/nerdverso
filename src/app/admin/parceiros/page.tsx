import { requirePermission } from "@/lib/auth/authorize";
import { getPartnersAdmin } from "@/lib/data/admin-partners";
import { PartnerList } from "./partner-list";

export const metadata = { title: "Parceiros" };

export default async function AdminPartnersPage() {
  await requirePermission("partners.view");
  const partners = await getPartnersAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Parceiros</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Afiliados com links de indicação, rastreamento de cliques e comissão por venda.
        </p>
      </div>
      <PartnerList partners={partners} />
    </div>
  );
}
