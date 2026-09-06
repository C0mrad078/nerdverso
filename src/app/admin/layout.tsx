import type { Metadata } from "next";
import Link from "next/link";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { requireAdminSession } from "@/lib/auth/authorize";
import { logoutAction } from "@/lib/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { default: "Painel Nerdverso", template: "%s | Painel Nerdverso" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdminSession();

  return (
    <html lang="pt-BR" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full bg-background text-foreground">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar p-4 lg:flex">
          <Link href="/admin" className="px-3 py-2 font-display text-lg text-foreground">
            nerdverso <span className="text-primary">admin</span>
          </Link>
          <div className="mt-6 flex-1 overflow-y-auto">
            <AdminNav isOwner={session.user.isOwner} permissions={session.user.permissions} />
          </div>
          <div className="border-t border-border pt-3">
            <p className="truncate px-3 text-sm text-foreground">{session.user.name}</p>
            <p className="truncate px-3 text-xs text-muted-foreground">{session.user.email}</p>
            <div className="mt-2 flex flex-col gap-1">
              <Link href="/" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">
                Ver loja
              </Link>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start px-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminMobileNav isOwner={session.user.isOwner} permissions={session.user.permissions} />
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
