import fs from "node:fs"
import path from "node:path"

import { processImageBufferForPrint } from "./processImageForPrint"
import type { ProcessedImage } from "./types"

const DOWNLOAD_TIMEOUT_MS = 30_000
const MAX_RETRIES = 1
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

/**
 * Resolve an image URL to a Buffer.
 * - Relative URLs (e.g. /uploads/photos/...) are read from the local filesystem
 * - Absolute URLs (e.g. https://...) are fetched via HTTP
 */
async function fetchImage(url: string, attempt = 0): Promise<Buffer | null> {
  if (url.startsWith("/uploads/")) {
    try {
      const rel = url.slice("/uploads/".length)
      if (rel.includes("..") || rel.includes("\\")) {
        console.error(`[pdf] Unsafe local path: ${url}`)
        return null
      }
      const fullPath = path.join(LOCAL_UPLOADS_DIR, rel)
      if (!fs.existsSync(fullPath)) {
        console.error(`[pdf] Local file not found: ${fullPath}`)
        return null
      }
      return fs.readFileSync(fullPath)
    } catch (err) {
      console.error(
        `[pdf] Failed to read local file ${url}: ${(err as Error).message}`
      )
      return null
    }
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS)

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }

    return Buffer.from(await res.arrayBuffer())
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.warn(`[pdf] Retry download (attempt ${attempt + 1}): ${url}`)
      return fetchImage(url, attempt + 1)
    }
    console.error(`[pdf] Failed to download ${url}: ${(err as Error).message}`)
    return null
  }
}

export interface UploadItem {
  url: string
  lineItemTitle?: string
  propertyName?: string
}

export async function downloadAndProcessAll(
  uploads: UploadItem[],
  cellWidthPx: number,
  cellHeightPx: number
): Promise<(ProcessedImage | null)[]> {
  console.info(
    `[pdf] Downloading ${uploads.length} image(s) (target: ${cellWidthPx}x${cellHeightPx}px)`
  )

  const results = await Promise.all(
    uploads.map(async ({ url }, index) => {
      const raw = await fetchImage(url)
      if (!raw) return null

      const processed = await processImageBufferForPrint(
        raw,
        cellWidthPx,
        cellHeightPx
      )
      if (processed) {
        console.info(`[pdf] Image ${index + 1}/${uploads.length} processed`)
      }
      return processed
    })
  )

  const successCount = results.filter(Boolean).length
  console.info(
    `[pdf] ${successCount}/${uploads.length} image(s) downloaded and processed`
  )
  return results
}
