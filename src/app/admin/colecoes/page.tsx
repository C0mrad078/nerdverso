import { requirePermission } from "@/lib/auth/authorize";
import { getCollectionsAdmin } from "@/lib/data/admin-catalog";
import { CollectionList } from "./collection-list";

export const metadata = { title: "Coleções" };

export default async function AdminCollectionsPage() {
  await requirePermission("collections.view");
  const collections = await getCollectionsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Coleções</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Universos temáticos (ex: Games, K-pop) usados nos nichos da home.
        </p>
      </div>
      <CollectionList collections={collections} />
    </div>
  );
}
