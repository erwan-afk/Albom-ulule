import { linkOAuthAccount } from "@/actions/auth"
import { getUserById } from "@/actions/user"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"

import { env } from "@/env.mjs"
import { authConfig } from "@/auth.config"
import providerConfig from "@/config/auth"
import { prisma } from "@/config/db"

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  debug: env.NODE_ENV === "development",
  secret: env.AUTH_SECRET,
  events: {
    async linkAccount({ user }) {
      if (user.id) await linkOAuthAccount({ userId: user.id })
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (!user.id) return false
      if (account?.provider !== "credentials") return true

      const existingUser = await getUserById({ id: user.id })

      return !existingUser?.emailVerified ? false : true
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: providerConfig.providers,
})
