import { requirePermission } from "@/lib/auth/authorize";
import { getBannersAdmin } from "@/lib/data/admin-catalog";
import { BannerList } from "./banner-list";

export const metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  await requirePermission("banners.view");
  const banners = await getBannersAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Banners</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Controle os banners da loja sem alterar código. Alterações aparecem na home imediatamente.
        </p>
      </div>
      <BannerList banners={banners} />
    </div>
  );
}
