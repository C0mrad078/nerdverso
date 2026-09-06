"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  productName,
}: {
  images: { url: string; alt: string | null }[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-lg bg-surface">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt ?? productName}
            fill
            priority
            sizes="(min-width: 1024px) 44vw, 92vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Sem imagem
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-md ring-1 sm:w-full ${
                index === activeIndex ? "ring-primary" : "ring-border"
              }`}
              aria-label={`Ver imagem ${index + 1}`}
            >
              <Image src={image.url} alt={image.alt ?? productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
