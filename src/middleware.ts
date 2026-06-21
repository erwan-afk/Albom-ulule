import { NextResponse } from "next/server"

import { auth } from "@/auth"

/**
 * Protège /dashboard avec la même validation JWT que NextAuth (pas seulement
 * la présence d'un cookie, qui provoquait une boucle signin ↔ dashboard).
 */
export default auth((req) => {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  if (!isDashboard) return NextResponse.next()

  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl))
  }

  if (req.auth.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
