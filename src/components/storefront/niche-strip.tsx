import Image from "next/image";
import Link from "next/link";
import type { NicheData } from "@/lib/data/storefront";

export function NicheStrip({ niches }: { niches: NicheData[] }) {
  if (niches.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="font-display text-2xl text-foreground sm:text-3xl">
        Explore por universo
      </h2>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] sm:grid sm:grid-cols-4 sm:gap-5 sm:overflow-visible lg:grid-cols-7">
        {niches.map((niche) => (
          <Link
            key={niche.id}
            href={`/colecao/${niche.slug}`}
            className="group relative aspect-square w-28 shrink-0 overflow-hidden rounded-full ring-1 ring-border sm:w-auto"
          >
            {niche.image && (
              <Image
                src={niche.image}
                alt={niche.name}
                fill
                sizes="200px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3">
              <span className="text-center text-xs font-medium leading-tight text-white sm:text-sm">
                {niche.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
