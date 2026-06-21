import type { NextAuthConfig } from "next-auth"

/**
 * Config Auth.js compatible Edge (middleware).
 * Ne pas importer Prisma, emails React ni providers ici.
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    verifyRequest: "/signin/magic-link-signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as "USER" | "ADMIN"
      return session
    },
    authorized({ auth, request }) {
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")
      if (!isDashboard) return true

      if (!auth?.user) return false

      if (auth.user.role !== "ADMIN") {
        return Response.redirect(new URL("/", request.nextUrl))
      }

      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
