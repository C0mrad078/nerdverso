"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/client";

const emailSchema = z.string().trim().toLowerCase().email();

export async function subscribeToNewsletter(
  _prevState: { status: "idle" | "success" | "error"; message: string },
  formData: FormData,
): Promise<{ status: "idle" | "success" | "error"; message: string }> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { status: "error", message: "Digite um e-mail válido." };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data },
    update: {},
    create: { email: parsed.data },
  });

  return { status: "success", message: "Inscrito! Fique de olho no seu e-mail." };
}
