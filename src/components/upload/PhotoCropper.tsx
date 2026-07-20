"use client"

import { useCallback, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"

import { Button } from "@/components/ui/button"
import { cropToBlob } from "@/components/upload/cropImage"
import type { CropState } from "@/components/upload/uploadPhoto.types"

export type CropResult = CropState & {
  blob: Blob
}

type Props = {
  imageSrc: string
  ratio: number
  initialCrop?: CropState["crop"]
  initialZoom?: number
  onCancel: () => void
  onConfirm: (result: CropResult) => Promise<void> | void
}

export function PhotoCropper({
  imageSrc,
  ratio,
  initialCrop,
  initialZoom,
  onCancel,
  onConfirm,
}: Props): JSX.Element {
  const [crop, setCrop] = useState(initialCrop ?? { x: 0, y: 0 })
  const [zoom, setZoom] = useState(initialZoom ?? 1)
  const [pixelArea, setPixelArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setPixelArea(areaPixels)
  }, [])

  const handleConfirm = async () => {
    if (!pixelArea) {
      console.warn("[PhotoCropper] handleConfirm: pixelArea est null")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const blob = await cropToBlob(imageSrc, pixelArea)
      await onConfirm({ blob, crop, zoom })
    } catch (e: unknown) {
      console.error("[PhotoCropper] Erreur:", e)
      setError(e instanceof Error ? e.message : "Échec du recadrage")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex w-full max-w-2xl flex-col rounded-lg bg-background">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Recadrer la photo</h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Annuler
          </button>
        </div>

        <div className="relative h-[60vh] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={ratio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </div>

        <div className="flex flex-col gap-3 p-4">
          {error && (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-2 text-sm">
              Zoom
              <input
                type="range"
                min={1}
                max={4}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1"
              />
            </label>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={busy || !pixelArea}
            >
              {busy ? "Enregistrement..." : "Valider le recadrage"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
