import { unstable_cache } from "next/cache"

import { prisma } from "@/config/db"
import { DEFAULT_ULULE_URL } from "@/config/site"

export const SITE_SETTINGS_CACHE_TAG = "site-settings"

async function readUluleUrlFromDb(): Promise<string> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
      select: { ululeUrl: true },
    })
    const url = settings?.ululeUrl?.trim()
    return url || DEFAULT_ULULE_URL
  } catch (error) {
    console.error("Impossible de lire le lien Ulule", error)
    return DEFAULT_ULULE_URL
  }
}

export const getUluleUrl = unstable_cache(readUluleUrlFromDb, ["ulule-url"], {
  tags: [SITE_SETTINGS_CACHE_TAG],
})
