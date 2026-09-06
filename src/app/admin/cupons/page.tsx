import { requirePermission } from "@/lib/auth/authorize";
import { getCouponsAdmin } from "@/lib/data/admin-promotions";
import { CouponList } from "./coupon-list";

export const metadata = { title: "Cupons" };

export default async function AdminCouponsPage() {
  await requirePermission("coupons.view");
  const coupons = await getCouponsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Cupons</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Códigos promocionais com regras de desconto e limite de uso.
        </p>
      </div>
      <CouponList coupons={coupons} />
    </div>
  );
}
