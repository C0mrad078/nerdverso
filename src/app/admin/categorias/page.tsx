import { requirePermission } from "@/lib/auth/authorize";
import { getCategoriesAdmin } from "@/lib/data/admin-catalog";
import { CategoryList } from "./category-list";

export const metadata = { title: "Categorias" };

export default async function AdminCategoriesPage() {
  await requirePermission("categories.view");
  const categories = await getCategoriesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Categorias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Taxonomia de produtos (ex: Camisetas, Canecas).
        </p>
      </div>
      <CategoryList categories={categories} />
    </div>
  );
}
