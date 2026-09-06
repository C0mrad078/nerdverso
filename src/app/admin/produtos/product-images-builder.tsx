"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export type ImageItem = { url: string; alt: string; isPrimary: boolean };

export function ProductImagesBuilder({
  images,
  onChange,
}: {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}) {
  const [draftUrl, setDraftUrl] = useState("");

  function addImage() {
    if (!draftUrl.trim()) return;
    const next = [...images, { url: draftUrl.trim(), alt: "", isPrimary: images.length === 0 }];
    onChange(next);
    setDraftUrl("");
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index);
    if (next.length > 0 && !next.some((i) => i.isPrimary)) next[0].isPrimary = true;
    onChange(next);
  }

  function setPrimary(index: number) {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <Label>Imagens</Label>
      <div className="flex gap-2">
        <Input
          placeholder="/seed/products/tee-01.svg ou URL"
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addImage();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addImage}>
          Adicionar
        </Button>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, index) => (
            <div key={img.url + index} className="relative w-24">
              <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface">
                <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label="Remover imagem"
                className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
              <div className="mt-1 flex items-center justify-between gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  className={img.isPrimary ? "font-medium text-primary" : "text-muted-foreground"}
                >
                  {img.isPrimary ? "Principal" : "Definir"}
                </button>
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(index, -1)} className="text-muted-foreground">
                    ←
                  </button>
                  <button type="button" onClick={() => move(index, 1)} className="text-muted-foreground">
                    →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
