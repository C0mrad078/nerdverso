import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "relevancia", label: "Relevância" },
  { value: "novidades", label: "Novidades" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "desconto", label: "Maior desconto" },
] as const;

export function ListingFilters({
  sizes,
  colors,
  selectedSizes,
  selectedColors,
  sort,
  promoOnly,
  searchQuery,
}: {
  sizes: string[];
  colors: string[];
  selectedSizes: string[];
  selectedColors: string[];
  sort: string;
  promoOnly: boolean;
  searchQuery?: string;
}) {
  return (
    <form method="GET" className="flex flex-col gap-6">
      {searchQuery && <input type="hidden" name="q" value={searchQuery} />}

      <div>
        <label htmlFor="sort" className="text-sm font-medium text-foreground">
          Ordenar por
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={sort}
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="promo"
          value="1"
          defaultChecked={promoOnly}
          className="size-4 rounded border-border"
        />
        Somente promoções
      </label>

      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground">Tamanho</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <label
                key={size}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-foreground has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary"
              >
                <input
                  type="checkbox"
                  name="tamanho"
                  value={size}
                  defaultChecked={selectedSizes.includes(size)}
                  className="sr-only"
                />
                {size}
              </label>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground">Cor</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((color) => (
              <label
                key={color}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-foreground has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary"
              >
                <input
                  type="checkbox"
                  name="cor"
                  value={color}
                  defaultChecked={selectedColors.includes(color)}
                  className="sr-only"
                />
                {color}
              </label>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="rounded-full">
        Aplicar filtros
      </Button>
    </form>
  );
}
