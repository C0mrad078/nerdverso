import { requirePermission } from "@/lib/auth/authorize";
import { getPromotionsAdmin } from "@/lib/data/admin-promotions";
import { getCategoriesForSelect, getCollectionsForSelect } from "@/lib/data/admin-products";
import { PromotionList } from "./promotion-list";

export const metadata = { title: "Promoções" };

export default async function AdminPromotionsPage() {
  await requirePermission("promotions.view");
  const [promotions, categories, collections] = await Promise.all([
    getPromotionsAdmin(),
    getCategoriesForSelect(),
    getCollectionsForSelect(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Promoções</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Regras automáticas de desconto aplicadas por categoria ou coleção.
        </p>
      </div>
      <PromotionList promotions={promotions} categories={categories} collections={collections} />
    </div>
  );
}
