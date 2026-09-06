"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import { prisma } from "@/config/db"
import auth from "@/lib/auth"
import { SITE_SETTINGS_CACHE_TAG } from "@/lib/site-settings"
import { updateUluleUrlSchema } from "@/validations/site-settings"

export async function updateUluleUrl(rawUrl: string): Promise<{
  success: boolean
  ululeUrl?: string
  error?: string
}> {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Non autorisé." }
  }

  const validated = updateUluleUrlSchema.safeParse({ ululeUrl: rawUrl })
  if (!validated.success) {
    return {
      success: false,
      error:
        validated.error.issues[0]?.message ??
        "URL invalide. Vérifie le lien et réessaie.",
    }
  }

  const { ululeUrl } = validated.data

  try {
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ululeUrl },
      update: { ululeUrl },
    })
  } catch (error) {
    console.error("Impossible d'enregistrer le lien Ulule", error)
    return {
      success: false,
      error: "Impossible d'enregistrer le lien. Réessaie dans un instant.",
    }
  }

  revalidateTag(SITE_SETTINGS_CACHE_TAG)
  revalidatePath("/")
  revalidatePath("/mentions-legales")
  revalidatePath("/confidentialite")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")

  return { success: true, ululeUrl }
}
