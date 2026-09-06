import type { ProductListingParams, SortOption } from "@/lib/data/product-listing";

const VALID_SORTS: SortOption[] = ["relevancia", "novidades", "menor-preco", "maior-preco", "desconto"];

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseListingParams(
  searchParams: Record<string, string | string[] | undefined>,
): Omit<ProductListingParams, "categorySlug" | "collectionSlug"> {
  const sortParam = first(searchParams.sort);
  const sort = VALID_SORTS.includes(sortParam as SortOption) ? (sortParam as SortOption) : "relevancia";

  return {
    search: first(searchParams.q) || undefined,
    sort,
    promoOnly: first(searchParams.promo) === "1",
    sizes: toArray(searchParams.tamanho),
    colors: toArray(searchParams.cor),
    page: Number(first(searchParams.page)) || 1,
  };
}
