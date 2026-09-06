import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export const proxy = auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && pathname.startsWith("/conta")) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (!isLoggedIn && pathname.startsWith("/admin")) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/conta/:path*", "/admin/:path*"],
};
