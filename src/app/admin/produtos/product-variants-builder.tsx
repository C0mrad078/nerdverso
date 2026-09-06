"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AttributeDef = {
  id: string;
  name: string;
  values: { id: string; value: string }[];
};

export type VariantRow = {
  id?: string;
  sku: string;
  price: number | null;
  valueIds: string[];
  quantity: number;
  minStock: number;
};

function cartesian(groups: string[][]): string[][] {
  return groups.reduce<string[][]>(
    (acc, group) => acc.flatMap((combo) => group.map((value) => [...combo, value])),
    [[]],
  );
}

export function ProductVariantsBuilder({
  attributeDefs,
  baseSku,
  variants,
  onVariantsChange,
}: {
  attributeDefs: AttributeDef[];
  baseSku: string;
  variants: VariantRow[];
  onVariantsChange: (variants: VariantRow[]) => void;
}) {
  const [checkedValueIds, setCheckedValueIds] = useState<Set<string>>(
    () => new Set(variants.flatMap((v) => v.valueIds)),
  );

  const valueLookup = useMemo(() => {
    const map = new Map<string, { attributeId: string; attributeName: string; value: string }>();
    for (const attr of attributeDefs) {
      for (const val of attr.values) {
        map.set(val.id, { attributeId: attr.id, attributeName: attr.name, value: val.value });
      }
    }
    return map;
  }, [attributeDefs]);

  function toggleValue(valueId: string) {
    setCheckedValueIds((prev) => {
      const next = new Set(prev);
      if (next.has(valueId)) next.delete(valueId);
      else next.add(valueId);
      return next;
    });
  }

  function generateVariants() {
    const groupedByAttribute = attributeDefs
      .map((attr) => attr.values.map((v) => v.id).filter((id) => checkedValueIds.has(id)))
      .filter((group) => group.length > 0);

    if (groupedByAttribute.length === 0) {
      onVariantsChange([]);
      return;
    }

    const combos = cartesian(groupedByAttribute);
    const existingByKey = new Map(variants.map((v) => [[...v.valueIds].sort().join("|"), v]));

    const next = combos.map((combo, index) => {
      const key = [...combo].sort().join("|");
      const existing = existingByKey.get(key);
      if (existing) return existing;
      const label = combo.map((id) => valueLookup.get(id)?.value ?? "").join("-");
      return {
        sku: `${baseSku || "SKU"}-${label || index + 1}`.toUpperCase(),
        price: null,
        valueIds: combo,
        quantity: 0,
        minStock: 3,
      } satisfies VariantRow;
    });

    onVariantsChange(next);
  }

  function updateVariant(index: number, patch: Partial<VariantRow>) {
    onVariantsChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeVariant(index: number) {
    onVariantsChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Atributos e valores deste produto</Label>
        <div className="mt-2 flex flex-col gap-3">
          {attributeDefs.map((attr) => (
            <div key={attr.id}>
              <p className="text-sm font-medium text-foreground">{attr.name}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {attr.values.map((val) => (
                  <label
                    key={val.id}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                      checkedValueIds.has(val.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checkedValueIds.has(val.id)}
                      onChange={() => toggleValue(val.id)}
                    />
                    {val.value}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={generateVariants}>
          Gerar variantes
        </Button>
      </div>

      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Combinação</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Preço (opcional)</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={variant.id ?? variant.valueIds.join("-")}>
                  <TableCell className="text-sm text-foreground">
                    {variant.valueIds.map((id) => valueLookup.get(id)?.value).join(" / ")}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, { sku: e.target.value })}
                      className="w-40"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      value={variant.price ?? ""}
                      placeholder="Preço do produto"
                      onChange={(e) =>
                        updateVariant(index, {
                          price: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className="w-32"
                    />
                  </TableCell>
                  <TableCell>
                    {variant.id ? (
                      <span className="text-sm text-muted-foreground" title="Ajuste em /admin/estoque">
                        {variant.quantity} un.
                      </span>
                    ) : (
                      <Input
                        type="number"
                        min={0}
                        value={variant.quantity}
                        onChange={(e) => updateVariant(index, { quantity: Number(e.target.value) })}
                        className="w-24"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Estoque de variantes existentes é ajustado em Estoque, com histórico de movimentação.
      </p>
    </div>
  );
}
