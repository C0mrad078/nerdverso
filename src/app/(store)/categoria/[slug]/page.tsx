import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { ProductListingPage } from "@/components/storefront/listing/product-listing";
import { parseListingParams } from "@/lib/parse-listing-params";

export async function generateMetadata(props: PageProps<"/categoria/[slug]">) {
  const { slug } = await props.params;
  const category = await prisma.category.findUnique({ where: { slug } });
  return { title: category?.seoTitle ?? category?.name };
}

export default async function CategoryPage(props: PageProps<"/categoria/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  const category = await prisma.category.findUnique({ where: { slug, status: "ACTIVE" } });
  if (!category) notFound();

  const params = parseListingParams(searchParams);

  return (
    <ProductListingPage
      title={category.name}
      description={category.description ?? undefined}
      breadcrumbLabel={category.name}
      basePath={`/categoria/${slug}`}
      params={{ ...params, categorySlug: slug }}
    />
  );
}
