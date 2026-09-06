import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { ProductListingPage } from "@/components/storefront/listing/product-listing";
import { parseListingParams } from "@/lib/parse-listing-params";

export async function generateMetadata(props: PageProps<"/colecao/[slug]">) {
  const { slug } = await props.params;
  const collection = await prisma.collection.findUnique({ where: { slug } });
  return { title: collection?.seoTitle ?? collection?.name };
}

export default async function CollectionPage(props: PageProps<"/colecao/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  const collection = await prisma.collection.findUnique({ where: { slug, status: "ACTIVE" } });
  if (!collection) notFound();

  const params = parseListingParams(searchParams);

  return (
    <ProductListingPage
      title={collection.name}
      description={collection.description ?? undefined}
      breadcrumbLabel={collection.name}
      basePath={`/colecao/${slug}`}
      params={{ ...params, collectionSlug: slug }}
    />
  );
}
