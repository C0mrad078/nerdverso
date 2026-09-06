import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/authorize";
import {
  getAttributeDefinitionsAdmin,
  getCategoriesForSelect,
  getCollectionsForSelect,
  getProductByIdAdmin,
  getSizeGuidesAdmin,
} from "@/lib/data/admin-products";
import { ProductForm } from "../product-form";

export const metadata = { title: "Editar produto" };

export default async function EditProductPage(props: PageProps<"/admin/produtos/[id]">) {
  await requirePermission("products.update");
  const { id } = await props.params;

  const [product, categories, collections, attributeDefs, sizeGuides] = await Promise.all([
    getProductByIdAdmin(id),
    getCategoriesForSelect(),
    getCollectionsForSelect(),
    getAttributeDefinitionsAdmin(),
    getSizeGuidesAdmin(),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-foreground">Editar produto</h1>
      <ProductForm
        productId={product.id}
        categories={categories}
        collections={collections}
        attributeDefs={attributeDefs}
        sizeGuides={sizeGuides}
        initial={{
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          shortDescription: product.shortDescription,
          status: product.status,
          featured: product.featured,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          costPrice: product.costPrice,
          weightGrams: product.weightGrams,
          widthCm: product.widthCm,
          heightCm: product.heightCm,
          lengthCm: product.lengthCm,
          materials: product.materials,
          careInstructions: product.careInstructions,
          sizeGuideId: product.sizeGuideId,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          categoryIds: product.categoryIds,
          collectionIds: product.collectionIds,
          tagNames: product.tagNames,
          images: product.images.map((img) => ({
            url: img.url,
            alt: img.alt ?? "",
            isPrimary: img.isPrimary,
          })),
          variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            price: v.price,
            valueIds: v.valueIds,
            quantity: v.quantity,
            minStock: v.minStock,
          })),
        }}
      />
    </div>
  );
}
