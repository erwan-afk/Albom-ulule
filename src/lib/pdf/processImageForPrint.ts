import { PRINT_JPEG_QUALITY } from "@/lib/images/constants"

import type { ProcessedImage } from "./types"

const JPEG_OPTIONS = {
  quality: PRINT_JPEG_QUALITY,
  mozjpeg: true,
  chromaSubsampling: "4:4:4" as const,
}

/**
 * Prépare une image pour l'impression dans le PDF.
 * - Redimensionne au besoin (cover) vers la taille cellule @ DPI template
 * - Évite une recompression si le JPEG fait déjà la bonne taille
 * - Encode en JPEG haute qualité uniquement quand une transformation est nécessaire
 */
export async function processImageBufferForPrint(
  raw: Buffer,
  cellWidthPx: number,
  cellHeightPx: number
): Promise<ProcessedImage | null> {
  let sharp: any = null
  try {
    sharp = (await import("sharp")).default
  } catch {
    return { buffer: raw, format: "jpeg" }
  }

  try {
    const meta = await sharp(raw, { failOn: "none" }).metadata()
    const width = meta.width ?? 0
    const height = meta.height ?? 0
    const format = meta.format

    if (width === 0 || height === 0) {
      return null
    }

    const isJpeg = format === "jpeg" || format === "jpg"
    const exactSize = width === cellWidthPx && height === cellHeightPx

    if (exactSize && isJpeg) {
      return { buffer: raw, format: "jpeg" }
    }

    const needsResize = width !== cellWidthPx || height !== cellHeightPx
    let pipeline = sharp(raw, { failOn: "none" }).rotate()

    if (needsResize) {
      pipeline = pipeline.resize(cellWidthPx, cellHeightPx, {
        fit: "cover",
        position: "centre",
      })
    }

    const buffer = await pipeline.jpeg(JPEG_OPTIONS).toBuffer()
    return { buffer, format: "jpeg" }
  } catch (err) {
    console.error(
      `[pdf] processImageBufferForPrint failed: ${(err as Error).message}`
    )
    return null
  }
}
