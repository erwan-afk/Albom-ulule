export type PhotoProductConfig = {
  photosRequired: number
  photoRatio: "square" | "landscape" | "portrait" | "free"
  ratioValue: number
  ratioLabel: string // ex: "3:2"
  instructions?: string
}

const DEFAULT_CONFIG: PhotoProductConfig = {
  photosRequired: 1,
  photoRatio: "free",
  ratioValue: 1,
  ratioLabel: "libre",
}

/**
 * Extrait la configuration photo depuis les metafields custom.
 *
 * Metafields attendus (namespace: custom) :
 *   custom.photos_required → nombre (ex: "3")
 *   custom.photo_ratio     → "W:H"   (ex: "4:3", "1:1", "3:4")
 */
export function getPhotoProductConfig(
  metafields: Record<string, string>
): PhotoProductConfig {
  const config = { ...DEFAULT_CONFIG }

  const count = metafields["custom.photos_required"]
  if (count) {
    const n = parseInt(count, 10)
    if (n > 0 && n <= 20) config.photosRequired = n
  }

  const ratio = metafields["custom.photo_ratio"]
  if (ratio) {
    const parts = ratio.split(":")
    if (
      parts.length === 2 &&
      parts[0] !== undefined &&
      parts[1] !== undefined
    ) {
      const w = parseInt(parts[0], 10)
      const h = parseInt(parts[1], 10)
      if (w > 0 && h > 0) {
        config.ratioValue = w / h
        config.ratioLabel = ratio.trim()
        if (w === h) config.photoRatio = "square"
        else if (w > h) config.photoRatio = "landscape"
        else config.photoRatio = "portrait"
      }
    }
  }

  return config
}
