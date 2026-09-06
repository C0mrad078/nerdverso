import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductListingPage } from "@/components/storefront/listing/product-listing";
import { parseListingParams } from "@/lib/parse-listing-params";

export const metadata = { title: "Buscar" };

export default async function SearchPage(props: PageProps<"/buscar">) {
  const searchParams = await props.searchParams;
  const params = parseListingParams(searchParams);

  return (
    <div>
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <form method="GET" className="flex gap-2">
          <Input
            type="search"
            name="q"
            defaultValue={params.search ?? ""}
            placeholder="Buscar produtos, coleções, tags…"
            autoFocus
            className="h-11"
          />
          <Button type="submit" size="lg" className="rounded-full px-6">
            Buscar
          </Button>
        </form>
      </div>

      {params.search ? (
        <ProductListingPage
          title={`Resultados para "${params.search}"`}
          breadcrumbLabel="Buscar"
          basePath="/buscar"
          params={params}
        />
      ) : (
        <p className="px-4 py-16 text-center text-muted-foreground">
          Digite algo para buscar em nosso catálogo.
        </p>
      )}
    </div>
  );
}
