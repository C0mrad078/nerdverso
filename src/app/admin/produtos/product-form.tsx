"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NameSlugFields } from "@/components/admin/name-slug-fields";
import { StatusSelect } from "@/components/admin/status-select";
import { upsertProductAction } from "@/lib/actions/admin-products";
import type { FormState } from "@/lib/actions/auth";
import { ProductImagesBuilder, type ImageItem } from "./product-images-builder";
import { ProductVariantsBuilder, type AttributeDef, type VariantRow } from "./product-variants-builder";

const initialState: FormState = { status: "idle", message: "" };

type ProductFormProps = {
  productId?: string;
  categories: { id: string; name: string }[];
  collections: { id: string; name: string }[];
  attributeDefs: AttributeDef[];
  sizeGuides: { id: string; name: string }[];
  initial?: {
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    shortDescription: string | null;
    status: string;
    featured: boolean;
    price: number;
    compareAtPrice: number | null;
    costPrice: number | null;
    weightGrams: number | null;
    widthCm: number | null;
    heightCm: number | null;
    lengthCm: number | null;
    materials: string | null;
    careInstructions: string | null;
    sizeGuideId: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    categoryIds: string[];
    collectionIds: string[];
    tagNames: string[];
    images: ImageItem[];
    variants: VariantRow[];
  };
};

export function ProductForm({
  productId,
  categories,
  collections,
  attributeDefs,
  sizeGuides,
  initial,
}: ProductFormProps) {
  const action = upsertProductAction.bind(null, productId ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);

  const [images, setImages] = useState<ImageItem[]>(initial?.images ?? []);
  const [variants, setVariants] = useState<VariantRow[]>(initial?.variants ?? []);
  const [skuDraft, setSkuDraft] = useState(initial?.sku ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="grid grid-cols-1 gap-4 rounded-lg border border-border p-5 sm:grid-cols-2">
        <h2 className="font-display text-lg text-foreground sm:col-span-2">Informações básicas</h2>
        <NameSlugFields defaultName={initial?.name} defaultSlug={initial?.slug} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            name="sku"
            required
            value={skuDraft}
            onChange={(e) => setSkuDraft(e.target.value.toUpperCase())}
          />
        </div>

        <StatusSelect defaultValue={initial?.status ?? "DRAFT"} />

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="shortDescription">Descrição curta</Label>
          <Input id="shortDescription" name="shortDescription" defaultValue={initial?.shortDescription ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" name="description" rows={4} defaultValue={initial?.description ?? ""} />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initial?.featured ?? false}
            className="size-4 rounded border-border"
          />
          Produto em destaque
        </label>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-lg border border-border p-5 sm:grid-cols-3">
        <h2 className="font-display text-lg text-foreground sm:col-span-3">Preço</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input id="price" name="price" type="number" step="0.01" min={0} required defaultValue={initial?.price ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="compareAtPrice">Preço riscado (opcional)</Label>
          <Input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            step="0.01"
            min={0}
            defaultValue={initial?.compareAtPrice ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="costPrice">Custo (opcional, interno)</Label>
          <Input
            id="costPrice"
            name="costPrice"
            type="number"
            step="0.01"
            min={0}
            defaultValue={initial?.costPrice ?? ""}
          />
        </div>
      </section>

      <section className="rounded-lg border border-border p-5">
        <h2 className="font-display text-lg text-foreground">Organização</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Categorias</Label>
            <div className="mt-2 flex flex-col gap-1.5">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={cat.id}
                    defaultChecked={initial?.categoryIds.includes(cat.id) ?? false}
                    className="size-4 rounded border-border"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Coleções</Label>
            <div className="mt-2 flex flex-col gap-1.5">
              {collections.map((col) => (
                <label key={col.id} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="collectionIds"
                    value={col.id}
                    defaultChecked={initial?.collectionIds.includes(col.id) ?? false}
                    className="size-4 rounded border-border"
                  />
                  {col.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <Label htmlFor="tagNames">Tags (separadas por vírgula)</Label>
          <Input id="tagNames" name="tagNames" defaultValue={initial?.tagNames.join(", ") ?? ""} />
        </div>
      </section>

      <section className="rounded-lg border border-border p-5">
        <h2 className="font-display text-lg text-foreground">Imagens</h2>
        <div className="mt-4">
          <ProductImagesBuilder images={images} onChange={setImages} />
        </div>
      </section>

      <section className="rounded-lg border border-border p-5">
        <h2 className="font-display text-lg text-foreground">Variantes</h2>
        <div className="mt-4">
          <ProductVariantsBuilder
            attributeDefs={attributeDefs}
            baseSku={skuDraft}
            variants={variants}
            onVariantsChange={setVariants}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-lg border border-border p-5 sm:grid-cols-2">
        <h2 className="font-display text-lg text-foreground sm:col-span-2">
          Detalhes, frete e guia de medidas
        </h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="materials">Materiais</Label>
          <Input id="materials" name="materials" defaultValue={initial?.materials ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="careInstructions">Cuidados</Label>
          <Input id="careInstructions" name="careInstructions" defaultValue={initial?.careInstructions ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sizeGuideId">Guia de tamanhos</Label>
          <Select name="sizeGuideId" defaultValue={initial?.sizeGuideId ?? "none"}>
            <SelectTrigger id="sizeGuideId" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {sizeGuides.map((guide) => (
                <SelectItem key={guide.id} value={guide.id}>
                  {guide.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:col-span-2 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="weightGrams">Peso (g)</Label>
            <Input id="weightGrams" name="weightGrams" type="number" min={0} defaultValue={initial?.weightGrams ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="widthCm">Largura (cm)</Label>
            <Input id="widthCm" name="widthCm" type="number" min={0} defaultValue={initial?.widthCm ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="heightCm">Altura (cm)</Label>
            <Input id="heightCm" name="heightCm" type="number" min={0} defaultValue={initial?.heightCm ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lengthCm">Comprimento (cm)</Label>
            <Input id="lengthCm" name="lengthCm" type="number" min={0} defaultValue={initial?.lengthCm ?? ""} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 rounded-lg border border-border p-5 sm:grid-cols-2">
        <h2 className="font-display text-lg text-foreground sm:col-span-2">SEO</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seoTitle">Título</Label>
          <Input id="seoTitle" name="seoTitle" defaultValue={initial?.seoTitle ?? ""} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="seoDescription">Descrição</Label>
          <Input id="seoDescription" name="seoDescription" defaultValue={initial?.seoDescription ?? ""} />
        </div>
      </section>

      <input type="hidden" name="imagesJson" value={JSON.stringify(images)} readOnly />
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} readOnly />

      {state.status === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="self-start rounded-full px-8">
        {pending ? "Salvando…" : "Salvar produto"}
      </Button>
    </form>
  );
}
