import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Meus dados" };

export default async function AccountDataPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-xl text-foreground">Meus dados</h2>
        <div className="mt-6 max-w-md">
          <ProfileForm name={user.name} email={user.email} phone={user.phone ?? ""} />
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="font-display text-xl text-foreground">Alterar senha</h2>
        <div className="mt-6 max-w-md">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
