import Link from "next/link";
import { auth } from "@/lib/auth/config";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/conta", label: "Painel" },
  { href: "/conta/pedidos", label: "Meus pedidos" },
  { href: "/conta/enderecos", label: "Endereços" },
  { href: "/conta/dados", label: "Meus dados" },
] as const;

export default async function AccountLayout({ children }: LayoutProps<"/conta">) {
  const session = await auth();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-foreground">Minha conta</h1>
      {session?.user?.name && (
        <p className="mt-1 text-sm text-muted-foreground">Olá, {session.user.name}</p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start px-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Sair
            </Button>
          </form>
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}
