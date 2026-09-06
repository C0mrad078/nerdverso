import Link from "next/link";
import { requirePermission } from "@/lib/auth/authorize";
import { getAuditLogAdmin } from "@/lib/data/admin-audit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Auditoria" };

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("pt-BR");
}

export default async function AdminAuditPage(props: PageProps<"/admin/auditoria">) {
  await requirePermission("audit.view");
  const searchParams = await props.searchParams;
  const entityTypeParam = searchParams.entityType;
  const rawEntityType = Array.isArray(entityTypeParam) ? entityTypeParam[0] : entityTypeParam;
  const entityType = rawEntityType && rawEntityType !== "all" ? rawEntityType : undefined;
  const pageParam = searchParams.page;
  const page = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1;

  const { entries, total, pageCount, entityTypes } = await getAuditLogAdmin({ entityType, page });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Auditoria</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} eventos registrados.</p>
      </div>

      <form method="GET" className="flex max-w-sm items-end gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="entityType" className="text-sm text-foreground">
            Tipo de entidade
          </label>
          <select
            id="entityType"
            name="entityType"
            defaultValue={entityType ?? "all"}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">Todos os tipos</option>
            {entityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhum evento registrado.
                </TableCell>
              </TableRow>
            )}
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-muted-foreground">{formatDateTime(entry.createdAt)}</TableCell>
                <TableCell>{entry.user?.name ?? "Sistema"}</TableCell>
                <TableCell className="font-mono text-xs">{entry.action}</TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.entityType} · {entry.entityId}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {page} de {pageCount}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/auditoria?page=${page - 1}${entityType ? `&entityType=${entityType}` : ""}`}>
                  Anterior
                </Link>
              </Button>
            )}
            {page < pageCount && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/auditoria?page=${page + 1}${entityType ? `&entityType=${entityType}` : ""}`}>
                  Próxima
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
