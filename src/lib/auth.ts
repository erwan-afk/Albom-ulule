import { cache } from "react"
import { auth } from "@/auth"

export default cache(auth)

/**
 * Vérifie que la requête provient d'un admin authentifié.
 * Pour les API routes, vérifie soit la session NextAuth, soit un paramètre `secret`.
 */
export async function checkAdmin(req: Request): Promise<boolean> {
  // 1) Vérifier la session NextAuth (cookie)
  const session = await auth()
  if (session?.user?.role === "ADMIN") return true

  return false
}
