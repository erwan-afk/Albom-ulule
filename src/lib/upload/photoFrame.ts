import type { UploadPhoto } from "@/components/upload/uploadPhoto.types"

const ASPECT_TOLERANCE = 0.015

/** True when object-contain would leave visible red stripe gaps in the polaroid frame. */
export function photoHasGapZones(
  photo: UploadPhoto,
  frameAspect: number
): boolean {
  if (photo.status !== "ready" || !photo.previewUrl) return false
  if (photo.cropPreviewUrl) return false
  if (!photo.imageAspect) return false

  const relDiff =
    Math.abs(photo.imageAspect - frameAspect) / frameAspect
  return relDiff > ASPECT_TOLERANCE
}
