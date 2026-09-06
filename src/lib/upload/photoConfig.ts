import { getProductPhotoConfig } from "@/lib/products/photoConfigStore"

export type PhotoProductConfig = {
  photosRequired: number
  photoRatio: "square" | "landscape" | "portrait" | "free"
  ratioValue: number
  ratioLabel: string
  instructions?: string
}

const DEFAULT_CONFIG: PhotoProductConfig = {
  photosRequired: 1,
  photoRatio: "free",
  ratioValue: 1,
  ratioLabel: "libre",
}

/**
 * Résout la config upload pour une commande.
 * Source unique : catalogue produits du dashboard, sinon 1 photo libre.
 */
export function resolveUploadPhotoConfig(order: {
  productName?: string | null
  productHandle?: string | null
}): PhotoProductConfig {
  const fromDashboard = getProductPhotoConfig(
    order.productHandle,
    order.productName
  )
  return fromDashboard ?? DEFAULT_CONFIG
}
