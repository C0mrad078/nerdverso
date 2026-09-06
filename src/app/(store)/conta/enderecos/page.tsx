import { auth } from "@/lib/auth/config";
import { getAddressesForUser } from "@/lib/data/account";
import { AddressList } from "./address-list";

export const metadata = { title: "Endereços" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const addresses = await getAddressesForUser(session.user.id);

  return (
    <div>
      <h2 className="font-display text-xl text-foreground">Endereços</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Gerencie os endereços usados no checkout.
      </p>
      <div className="mt-6">
        <AddressList addresses={addresses} />
      </div>
    </div>
  );
}
