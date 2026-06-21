import type { PhotoProductConfig } from "@/lib/shopify/productMetafields"

export type RatioFields = {
  width: string
  height: string
  free: boolean
}

/** Construit le ratio stocké (ex. "74:105") depuis les champs mm. */
export function ratioLabelFromFields(
  width: string,
  height: string,
  free: boolean
): string {
  if (free) return "libre"
  const w = parseFloat(width.replace(",", "."))
  const h = parseFloat(height.replace(",", "."))
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return "libre"
  }
  return `${trimRatioNumber(w)}:${trimRatioNumber(h)}`
}

/** Décompose un ratio stocké en champs mm. */
export function fieldsFromRatioLabel(ratioLabel: string): RatioFields {
  const trimmed = ratioLabel.trim()
  if (!trimmed || trimmed === "libre") {
    return { width: "", height: "", free: true }
  }

  const parts = trimmed.split(":")
  if (parts.length === 2) {
    const w = parseFloat(parts[0]!.replace(",", "."))
    const h = parseFloat(parts[1]!.replace(",", "."))
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      return {
        width: String(w),
        height: String(h),
        free: false,
      }
    }
  }

  return { width: "", height: "", free: true }
}

function trimRatioNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100)
}

/** Affichage lisible pour l'upload client (ex. "74 × 105 mm"). */
export function formatRatioDisplay(ratioLabel: string): string {
  if (!ratioLabel || ratioLabel === "libre") return "libre"
  const { width, height, free } = fieldsFromRatioLabel(ratioLabel)
  if (free) return "libre"
  return `${width} × ${height} mm`
}

export function parseRatioLabel(ratioLabel: string): Pick<
  PhotoProductConfig,
  "photoRatio" | "ratioValue" | "ratioLabel"
> {
  const trimmed = ratioLabel.trim()
  if (!trimmed || trimmed === "libre") {
    return { photoRatio: "free", ratioValue: 1, ratioLabel: "libre" }
  }

  const parts = trimmed.split(":")
  if (parts.length === 2) {
    const w = parseFloat(parts[0]!.replace(",", "."))
    const h = parseFloat(parts[1]!.replace(",", "."))
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
      let photoRatio: PhotoProductConfig["photoRatio"] = "landscape"
      if (w === h) photoRatio = "square"
      else if (w < h) photoRatio = "portrait"
      return {
        photoRatio,
        ratioValue: w / h,
        ratioLabel: `${trimRatioNumber(w)}:${trimRatioNumber(h)}`,
      }
    }
  }

  return { photoRatio: "free", ratioValue: 1, ratioLabel: "libre" }
}
