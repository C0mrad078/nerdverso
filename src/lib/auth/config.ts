import { randomBytes } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { UserStatus } from "@/generated/prisma/client";

// A precomputed hash with no matching password, compared against when the
// email doesn't exist — keeps authorize()'s response time the same whether
// or not the account exists, so timing can't be used to enumerate emails.
const DUMMY_HASH_PROMISE = hashPassword(randomBytes(32).toString("hex"));

export const { handlers, auth, signIn, signOut } = NextAuth({
  // A shorter-lived JWT bounds how long a revoked account, changed role, or
  // banned status can keep working off a stale token before re-login picks
  // up the change (admin routes also re-check permissions fresh — see
  // src/lib/auth/authorize.ts — this just limits exposure everywhere else).
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        const valid = await verifyPassword(password, user?.passwordHash ?? (await DUMMY_HASH_PROMISE));
        if (!user || user.status !== UserStatus.ACTIVE || !valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            employee: true,
            roles: {
              include: { role: { include: { permissions: { include: { permission: true } } } } },
            },
          },
        });
        token.id = user.id;
        token.isOwner = dbUser?.isOwner ?? false;
        token.isEmployee = !!dbUser?.employee;
        token.permissions = [
          ...new Set(
            dbUser?.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key)) ?? [],
          ),
        ];
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id ?? "";
      session.user.isOwner = token.isOwner ?? false;
      session.user.isEmployee = token.isEmployee ?? false;
      session.user.permissions = token.permissions ?? [];
      return session;
    },
  },
});
