"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminNav } from "@/components/admin/admin-nav";

export function AdminMobileNav({
  isOwner,
  permissions,
}: {
  isOwner: boolean;
  permissions: string[];
}) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border px-4 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Abrir menu do painel">
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 overflow-y-auto overscroll-contain">
          <SheetHeader>
            <SheetTitle className="font-display text-left">
              nerdverso <span className="text-primary">admin</span>
            </SheetTitle>
          </SheetHeader>
          <div className="px-2">
            <AdminNav isOwner={isOwner} permissions={permissions} />
          </div>
        </SheetContent>
      </Sheet>
      <Link href="/admin" className="font-display text-base text-foreground">
        nerdverso <span className="text-primary">admin</span>
      </Link>
    </header>
  );
}
