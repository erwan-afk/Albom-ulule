import { UPLOAD_JPEG_QUALITY } from "@/lib/images/constants"

const HEIC_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
])

export function isHeicFile(file: File): boolean {
  if (HEIC_TYPES.has(file.type)) return true
  return /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)
}

async function convertWithHeicTo(file: File): Promise<Blob> {
  const { heicTo } = await import("heic-to")
  return heicTo({
    blob: file,
    type: "image/jpeg",
    quality: UPLOAD_JPEG_QUALITY,
  })
}

async function convertWithHeic2any(file: File): Promise<Blob> {
  const heic2any = (await import("heic2any")).default
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: UPLOAD_JPEG_QUALITY,
  })
  return Array.isArray(converted) ? converted[0]! : converted
}

async function convertWithServer(file: File): Promise<Blob> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("/api/convert-heic", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error || `Conversion serveur échouée (${res.status})`)
  }

  return res.blob()
}

/**
 * Browsers cannot render HEIC/HEIF in <img> or canvas.
 * Convertit en JPEG haute qualité avant upload (l'original HEIC n'est pas conservé).
 */
export async function prepareImageForPreview(file: File): Promise<File> {
  if (!isHeicFile(file)) return file

  const baseName = file.name.replace(/\.[^.]+$/i, "") || "photo"
  const attempts: Array<[string, () => Promise<Blob>]> = [
    ["heic-to", () => convertWithHeicTo(file)],
    ["heic2any", () => convertWithHeic2any(file)],
    ["serveur", () => convertWithServer(file)],
  ]

  const errors: string[] = []

  for (const [name, convert] of attempts) {
    try {
      const blob = await convert()
      return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn(`[heic] ${name} failed:`, message)
      errors.push(message)
    }
  }

  throw new Error(
    errors.length > 0
      ? `Conversion HEIC impossible : ${errors[errors.length - 1]}`
      : "Conversion HEIC impossible"
  )
}
