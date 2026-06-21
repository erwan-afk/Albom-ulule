import { isHeicFile, prepareImageForPreview } from "@/lib/images/prepareImageFile"

/** Miniature légère pour l'UI (sidebar + grille). L'original reste pour l'upload. */
export async function createPreviewThumbnail(
  file: File,
  maxEdge = 480
): Promise<{ sourceFile: File; thumbUrl: string }> {
  const sourceFile = isHeicFile(file) ? await prepareImageForPreview(file) : file

  const bitmap = await createImageBitmap(sourceFile)
  const longest = Math.max(bitmap.width, bitmap.height)
  const scale = longest > maxEdge ? maxEdge / longest : 1

  if (scale >= 1) {
    const thumbUrl = URL.createObjectURL(sourceFile)
    bitmap.close()
    return { sourceFile, thumbUrl }
  }

  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    bitmap.close()
    const thumbUrl = URL.createObjectURL(sourceFile)
    return { sourceFile, thumbUrl }
  }

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Thumbnail failed"))),
      "image/jpeg",
      0.8
    )
  })

  return { sourceFile, thumbUrl: URL.createObjectURL(blob) }
}

/** URL pleine résolution pour le recadrage (créée à la demande). */
export function createFullPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}
