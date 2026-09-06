import type { DefaultSession } from "next-auth";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      isOwner: boolean;
      isEmployee: boolean;
      permissions: string[];
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    isOwner?: boolean;
    isEmployee?: boolean;
    permissions?: string[];
  }
}
