import type { Metadata } from "next";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nerdverso — Cultura geek em camisetas e canecas",
    template: "%s | Nerdverso",
  },
  description:
    "Nerdverso é a loja independente de camisetas, canecas e produtos geek: games, animes, K-pop, bandas e cultura pop em coleções exclusivas.",
};

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`dark ${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
