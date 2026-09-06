import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, formatDate } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  BANNED: "Banido",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  BANNED: "destructive",
};

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
};

export function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead>Pedidos</TableHead>
            <TableHead>Total gasto</TableHead>
            <TableHead>Última compra</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">
                <Link href={`/admin/clientes/${customer.id}`} className="hover:underline">
                  {customer.name}
                </Link>
                <span className="block text-xs text-muted-foreground">{customer.email}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(customer.createdAt)}</TableCell>
              <TableCell className="tabular-nums">{customer.orderCount}</TableCell>
              <TableCell className="tabular-nums">{formatMoney(customer.totalSpent)}</TableCell>
              <TableCell className="text-muted-foreground">
                {customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "—"}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[customer.status] ?? "secondary"}>
                  {STATUS_LABELS[customer.status] ?? customer.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
