import type { PhotoProductConfig } from "@/lib/shopify/productMetafields"
import { getPhotoProductConfig } from "@/lib/shopify/productMetafields"
import { getProductPhotoConfig } from "@/lib/products/photoConfigStore"

const DEFAULT_CONFIG: PhotoProductConfig = {
  photosRequired: 1,
  photoRatio: "free",
  ratioValue: 1,
  ratioLabel: "libre",
}

/**
 * Résout la config upload pour une commande.
 * Priorité : dashboard Albom → Shopify metafields → défaut (1 photo).
 */
export function resolveUploadPhotoConfig(
  order: { productName?: string | null; productHandle?: string | null },
  metafields?: Record<string, string> | null
): PhotoProductConfig {
  const fromDashboard = getProductPhotoConfig(
    order.productHandle,
    order.productName
  )
  if (fromDashboard) return fromDashboard

  if (metafields) {
    const fromShopify = getPhotoProductConfig(metafields)
    const hasShopifyOverride =
      Boolean(metafields["custom.photos_required"]) ||
      Boolean(metafields["custom.photo_ratio"])
    if (hasShopifyOverride) return fromShopify
  }

  return DEFAULT_CONFIG
}
