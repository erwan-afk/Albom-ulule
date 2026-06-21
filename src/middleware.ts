import NextAuth from "next-auth"

import { authConfig } from "@/auth.config"

/**
 * Middleware Edge : utilise uniquement auth.config (pas auth.ts / emails / Prisma).
 */
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: ["/dashboard/:path*"],
}
