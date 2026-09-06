import { requirePermission } from "@/lib/auth/authorize";
import {
  getAttributeDefinitionsAdmin,
  getCategoriesForSelect,
  getCollectionsForSelect,
  getSizeGuidesAdmin,
} from "@/lib/data/admin-products";
import { ProductForm } from "../product-form";

export const metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  await requirePermission("products.create");

  const [categories, collections, attributeDefs, sizeGuides] = await Promise.all([
    getCategoriesForSelect(),
    getCollectionsForSelect(),
    getAttributeDefinitionsAdmin(),
    getSizeGuidesAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-foreground">Novo produto</h1>
      <ProductForm
        categories={categories}
        collections={collections}
        attributeDefs={attributeDefs}
        sizeGuides={sizeGuides}
      />
    </div>
  );
}
