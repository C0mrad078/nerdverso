import { ProductListingPage } from "@/components/storefront/listing/product-listing";
import { parseListingParams } from "@/lib/parse-listing-params";

export const metadata = { title: "Produtos" };

export default async function ProductsPage(props: PageProps<"/produtos">) {
  const searchParams = await props.searchParams;
  const params = parseListingParams(searchParams);

  return (
    <ProductListingPage
      title="Todos os produtos"
      breadcrumbLabel="Produtos"
      basePath="/produtos"
      params={params}
    />
  );
}
