import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  DRAFT: "Rascunho",
  ARCHIVED: "Arquivado",
};

export function StatusSelect({ defaultValue = "ACTIVE" }: { defaultValue?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="status">Status</Label>
      <Select name="status" defaultValue={defaultValue}>
        <SelectTrigger id="status" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
