import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Cookies de session posés par Auth.js (next-auth v5).
// HTTP en local, "__Secure-" en production HTTPS.
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
]

/**
 * Première barrière : on bloque l'accès au dashboard avant même de rendre la page
 * si aucun cookie de session n'est présent. La vérification fine (validité du JWT
 * + rôle ADMIN) reste faite côté serveur dans le layout du dashboard.
 */
export function middleware(req: NextRequest): NextResponse {
  const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name))

  if (!hasSession) {
    const signInUrl = new URL("/signin", req.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
