import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/auth/authorize";

export const metadata = { title: "Sem permissão" };

// Only requires being staff (requireAdminSession), never a specific
// permission — requirePermission() redirects here on denial, so this page
// must not be able to redirect into itself or it becomes an infinite loop.
export default async function NoPermissionPage() {
  await requireAdminSession();

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="font-display text-2xl text-foreground">Sem permissão</h1>
      <p className="max-w-sm text-muted-foreground">
        Seu cargo não tem acesso a essa área. Fale com um administrador se precisar de acesso.
      </p>
      <Button asChild className="rounded-full">
        <Link href="/">Voltar à loja</Link>
      </Button>
    </div>
  );
}
