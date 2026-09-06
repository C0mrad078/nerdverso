"use server";

import { createHash, randomBytes } from "node:crypto";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { auth, signIn, signOut } from "@/lib/auth/config";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { mergeGuestCartIntoUser } from "@/lib/cart/session";
import {
  addressSchema,
  changePasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
} from "@/lib/validation/auth";
import { z } from "zod";

export type FormState = { status: "idle" | "error" | "success"; message: string };

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { status: "error", message: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      customer: { create: {} },
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });
  await mergeGuestCartIntoUser(user.id);
  redirect("/conta");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { status: "error", message: "E-mail ou senha inválidos." };
    }
    throw error;
  }

  const session = await auth();
  if (session?.user?.id) {
    await mergeGuestCartIntoUser(session.user.id);
  }

  const callbackUrl = String(formData.get("callbackUrl") ?? "/conta");
  redirect(callbackUrl.startsWith("/") ? callbackUrl : "/conta");
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/");
}

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { status: "error", message: "Sessão expirada." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });

  revalidatePath("/conta/dados");
  return { status: "success", message: "Dados atualizados." };
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { status: "error", message: "Sessão expirada." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { status: "error", message: "Senha atual incorreta." };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { status: "success", message: "Senha alterada com sucesso." };
}

export async function upsertAddressAction(
  addressId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id) return { status: "error", message: "Sessão expirada." };

  const parsed = addressSchema.safeParse({
    label: formData.get("label"),
    recipientName: formData.get("recipientName"),
    phone: formData.get("phone"),
    zipCode: formData.get("zipCode"),
    street: formData.get("street"),
    number: formData.get("number"),
    complement: formData.get("complement"),
    neighborhood: formData.get("neighborhood"),
    city: formData.get("city"),
    state: formData.get("state"),
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const data = { ...parsed.data, userId: session.user.id };

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  if (addressId) {
    const owned = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });
    if (!owned) return { status: "error", message: "Endereço não encontrado." };
    await prisma.address.update({ where: { id: addressId }, data });
  } else {
    await prisma.address.create({ data });
  }

  revalidatePath("/conta/enderecos");
  return { status: "success", message: "Endereço salvo." };
}

export async function deleteAddressAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const addressId = String(formData.get("addressId") ?? "");
  if (!addressId) return;

  await prisma.address.deleteMany({ where: { id: addressId, userId: session.user.id } });
  revalidatePath("/conta/enderecos");
}

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * Always returns the same generic message so the response can't be used to
 * enumerate registered emails. No email provider is configured yet, so in
 * development the reset link is returned directly for testing; wire a real
 * transactional email send here before shipping this to production.
 */
export async function requestPasswordResetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState & { devResetUrl?: string }> {
  const email = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  const generic: FormState = {
    status: "success",
    message: "Se esse e-mail estiver cadastrado, enviaremos um link de redefinição.",
  };
  if (!email.success) return generic;

  const user = await prisma.user.findUnique({ where: { email: email.data } });
  if (!user) return generic;

  const rawToken = randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const resetUrl = `/redefinir-senha?token=${rawToken}`;
  if (process.env.NODE_ENV !== "production") {
    return { ...generic, devResetUrl: resetUrl };
  }
  return generic;
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const rawToken = String(formData.get("token") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!rawToken) return { status: "error", message: "Link de redefinição inválido." };
  if (newPassword.length < 8) {
    return { status: "error", message: "A nova senha precisa ter pelo menos 8 caracteres." };
  }
  if (newPassword !== confirmPassword) {
    return { status: "error", message: "As senhas não coincidem." };
  }

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
  });

  if (
    !tokenRecord ||
    tokenRecord.usedAt ||
    tokenRecord.expiresAt < new Date()
  ) {
    return { status: "error", message: "Link de redefinição inválido ou expirado." };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: tokenRecord.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { status: "success", message: "Senha redefinida. Você já pode entrar." };
}
