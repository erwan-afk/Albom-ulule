"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { confirmUpload } from "@/actions/order"
import { deleteUploadedFile, uploadFile } from "@/actions/upload"
import {
  CheckCircledIcon,
  CrossCircledIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons"

import type { PhotoProductConfig } from "@/lib/shopify/productMetafields"
import {
  createFullPreviewUrl,
  createPreviewThumbnail,
} from "@/lib/images/createPreviewThumbnail"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PhotoCropper, type CropResult } from "@/components/upload/PhotoCropper"
import { PhotoDropzone } from "@/components/upload/PhotoDropzone"
import { PhotoGridTile } from "@/components/upload/PhotoGridTile"
import type { UploadPhoto } from "@/components/upload/uploadPhoto.types"
import { photoHasGapZones } from "@/lib/upload/photoFrame"

type ServerFile = {
  id: string
  originalName: string
  sizeBytes: number
}

type UploadFlowProps = {
  productTitle: string
  productHandle: string
  token: string
  config: PhotoProductConfig
}

export function UploadFlow({
  token,
  config,
}: UploadFlowProps): JSX.Element {
  const [serverFiles, setServerFiles] = useState<ServerFile[]>([])
  const [photos, setPhotos] = useState<UploadPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [limitDialogOpen, setLimitDialogOpen] = useState(false)
  const [cropTargetId, setCropTargetId] = useState<string | null>(null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set())

  const cropTarget = photos.find((p) => p.id === cropTargetId) ?? null

  const photosRequired = config.photosRequired
  const frameAspect =
    config.photoRatio === "free" ? 74 / 105 : config.ratioValue

  const selectedPhotos = useMemo(
    () => photos.filter((p) => p.selected),
    [photos]
  )
  const selectedCount = selectedPhotos.length
  const uncroppedSelectedCount = useMemo(
    () =>
      selectedPhotos.filter((p) => photoHasGapZones(p, frameAspect)).length,
    [selectedPhotos, frameAspect]
  )

  const trackUrl = useCallback((url: string) => {
    objectUrlsRef.current.add(url)
    return url
  }, [])

  const revokeUrl = useCallback((url: string) => {
    if (objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url)
      objectUrlsRef.current.delete(url)
    }
  }, [])

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/order/${token}`)
      if (!res.ok) throw new Error("Commande introuvable")
      const data = await res.json()
      setServerFiles(data.files ?? [])
      if (data.status === "PHOTOS_UPLOADED") setConfirmed(true)
    } catch {
      setError("Commande introuvable.")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
      objectUrlsRef.current.clear()
    }
  }, [])

  const handleAddFiles = useCallback(
    (files: File[]) => {
      const placeholders = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: "",
        status: "pending" as const,
        selected: false,
      }))

      setPhotos((prev) => [...prev, ...placeholders])

      void (async () => {
        for (const placeholder of placeholders) {
          try {
            const { sourceFile, thumbUrl, width, height } =
              await createPreviewThumbnail(placeholder.file, 480)
            trackUrl(thumbUrl)

            setPhotos((prev) =>
              prev.map((p) =>
                p.id === placeholder.id
                  ? {
                      ...p,
                      previewUrl: thumbUrl,
                      sourceFile,
                      imageAspect: width / height,
                      status: "ready" as const,
                    }
                  : p
              )
            )
          } catch (err) {
            console.error("[UploadFlow] preview failed:", err)
            setPhotos((prev) =>
              prev.map((p) =>
                p.id === placeholder.id
                  ? {
                      ...p,
                      status: "error",
                      error:
                        err instanceof Error
                          ? err.message
                          : "Impossible de lire ce fichier.",
                    }
                  : p
              )
            )
          }
        }
      })()
    },
    [trackUrl]
  )

  const handleToggleSelect = useCallback(
    (id: string) => {
      const target = photos.find((p) => p.id === id)
      if (!target || target.status !== "ready") return

      if (target.selected) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, selected: false } : p))
        )
        return
      }

      const currentSelected = photos.filter((p) => p.selected).length
      if (currentSelected >= photosRequired) {
        setLimitDialogOpen(true)
        return
      }

      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, selected: true } : p))
      )
    },
    [photos, photosRequired]
  )

  const handleRemove = useCallback(
    (id: string) => {
      if (cropTargetId === id) {
        setCropTargetId(null)
        if (cropImageSrc) revokeUrl(cropImageSrc)
        setCropImageSrc(null)
      }
      setPhotos((prev) => {
        const target = prev.find((p) => p.id === id)
        if (target?.previewUrl) revokeUrl(target.previewUrl)
        if (target?.cropPreviewUrl) revokeUrl(target.cropPreviewUrl)
        return prev.filter((p) => p.id !== id)
      })
    },
    [cropTargetId, cropImageSrc, revokeUrl]
  )

  const openCropper = useCallback(
    (id: string) => {
      const photo = photos.find((p) => p.id === id)
      if (!photo?.sourceFile) return
      if (cropImageSrc) revokeUrl(cropImageSrc)
      const url = trackUrl(createFullPreviewUrl(photo.sourceFile))
      setCropImageSrc(url)
      setCropTargetId(id)
    },
    [photos, cropImageSrc, revokeUrl, trackUrl]
  )

  const closeCropper = useCallback(() => {
    setCropTargetId(null)
    if (cropImageSrc) {
      revokeUrl(cropImageSrc)
      setCropImageSrc(null)
    }
  }, [cropImageSrc, revokeUrl])

  const submitSelection = async () => {
    setConfirmDialogOpen(false)
    setUploading(true)

    const selected = photos.filter(
      (p) => p.selected && p.status !== "error" && p.status !== "uploading"
    )

    for (const photo of selected) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, status: "uploading" } : p))
      )

      try {
        const raw: Blob | File | undefined =
          photo.cropBlob ?? photo.sourceFile
        if (!raw) continue

        const file =
          raw instanceof File
            ? raw
            : new File([raw], `photo-${photo.id.slice(0, 8)}.jpg`, {
                type: "image/jpeg",
              })

        const formData = new FormData()
        formData.append("token", token)
        formData.append("file", file)

        const result = await uploadFile(formData)
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? {
                  ...p,
                  status: result.success ? "ready" : "error",
                  error: result.error,
                }
              : p
          )
        )
      } catch {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, status: "error", error: "Erreur upload" }
              : p
          )
        )
      }
    }

    const confirmResult = await confirmUpload(token)
    if (!confirmResult.success) {
      setUploading(false)
      setError(
        confirmResult.error ||
          "La génération du PDF a échoué. Réessaie ou contacte le support."
      )
      return
    }

    setConfirmed(true)
    await fetchOrder()
    setUploading(false)
  }

  const handleDeleteServerFile = async (fileId: string) => {
    await deleteUploadedFile(fileId, token)
    await fetchOrder()
  }

  const handleCropConfirm = (result: CropResult) => {
    if (!cropTarget) return
    const cropPreviewUrl = trackUrl(URL.createObjectURL(result.blob))

    setPhotos((prev) =>
      prev.map((p) =>
        p.id === cropTarget.id
          ? {
              ...p,
              cropBlob: result.blob,
              cropPreviewUrl,
              cropState: { crop: result.crop, zoom: result.zoom },
              status: "ready" as const,
            }
          : p
      )
    )
    closeCropper()
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <UpdateIcon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
        <CrossCircledIcon className="size-16 text-destructive" />
        <h1 className="text-2xl font-bold">Lien invalide</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  const allReady =
    selectedCount >= photosRequired &&
    selectedPhotos.every((p) => p.status === "ready")

  const confirmLabel = uploading ? "Génération du PDF…" : "Confirmer la sélection"
  const photosLabel = `${photosRequired} photo${photosRequired > 1 ? "s" : ""}`

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="sticky top-0 z-20 shrink-0 bg-background">
        <header className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">
            {confirmed
              ? "Photos déposées"
              : "Choisis tes meilleurs souvenirs photo"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {confirmed
              ? `${photosLabel} déposées`
              : `Sélectionne ${photosLabel} pour ton Albom`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!confirmed && (
            <Button
              size="sm"
              className="sm:size-default"
              onClick={() => setConfirmDialogOpen(true)}
              disabled={!allReady || uploading}
              title={
                !allReady
                  ? `Sélectionne ${photosRequired} photos prêtes pour confirmer`
                  : undefined
              }
            >
              {uploading && (
                <UpdateIcon className="mr-2 size-4 animate-spin" />
              )}
              {confirmLabel}
            </Button>
          )}
          {confirmed && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
              <CheckCircledIcon className="size-3.5" />
              Terminé
            </span>
          )}
        </div>
      </header>

        {!confirmed && (
          <div className="flex items-center gap-3 border-b px-4 py-2 sm:px-6">
            <div className="flex-1 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-[width] duration-300"
                style={{
                  width: `${Math.min(100, (selectedCount / photosRequired) * 100)}%`,
                }}
              />
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums">
              {selectedCount}/{photosRequired}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6">
          {confirmed ? (
            <div className="mx-auto max-w-md rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950">
              <CheckCircledIcon className="mx-auto mb-4 size-12 text-green-500" />
              <h2 className="text-xl font-semibold text-green-700 dark:text-green-300">
                Photos réceptionnées
              </h2>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Tu vas recevoir un e-mail de confirmation.
              </p>
              {serverFiles.length > 0 && (
                <ul className="mt-6 space-y-1.5 text-left">
                  {serverFiles.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 rounded-lg border bg-white/50 px-4 py-2 dark:bg-black/20"
                    >
                      <CheckCircledIcon className="size-4 shrink-0 text-green-500" />
                      <span className="truncate text-sm">{f.originalName}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <>
              {photos.length === 0 ? (
                <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 py-8">
                  <p className="text-center text-sm text-muted-foreground">
                    Importe tes photos, puis coche-en {photosRequired} pour ton
                    Albom. Tu peux en importer autant que tu veux pour faire le
                    tri.
                  </p>
                  <PhotoDropzone
                    onFiles={handleAddFiles}
                    disabled={confirmed}
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="mx-auto max-w-5xl space-y-6">
                  {selectedCount > 0 && (
                    <p className="text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Aperçu polaroid — les zones rouges indiquent les espaces
                      vides si la photo ne remplit pas le cadre. Recadre pour
                      les faire disparaître.
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    <PhotoDropzone
                      onFiles={handleAddFiles}
                      disabled={confirmed}
                      variant="tile"
                      aspectRatio={frameAspect}
                    />
                    {photos.map((p) => (
                      <PhotoGridTile
                        key={p.id}
                        photo={p}
                        frameAspect={frameAspect}
                        disabled={confirmed}
                        onToggleSelect={handleToggleSelect}
                        onCrop={openCropper}
                      />
                    ))}
                  </div>
                </div>
              )}

              {serverFiles.length > 0 && (
                <div className="mx-auto mt-8 max-w-5xl">
                  <h3 className="mb-2 text-sm font-semibold">Déjà envoyées</h3>
                  <ul className="space-y-1.5">
                    {serverFiles.map((f) => (
                      <li
                        key={f.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2"
                      >
                        <span className="truncate text-sm">
                          {f.originalName}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteServerFile(f.id)}
                        >
                          <TrashIcon className="size-4 text-destructive" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
      </div>

      {cropTarget && cropImageSrc && (
        <PhotoCropper
          key={cropTarget.id}
          imageSrc={cropImageSrc}
          ratio={frameAspect}
          initialCrop={cropTarget.cropState?.crop}
          initialZoom={cropTarget.cropState?.zoom}
          onCancel={closeCropper}
          onConfirm={handleCropConfirm}
        />
      )}

      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Limite de photos atteinte</DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Tu as déjà sélectionné {photosRequired} photo
              {photosRequired > 1 ? "s" : ""}. Désélectionne-en une pour en
              choisir une autre.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setLimitDialogOpen(false)}>
              Compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer ta sélection ?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-1 text-base text-foreground">
                <p>
                  Tu envoies{" "}
                  <strong>
                    {selectedCount} photo{selectedCount > 1 ? "s" : ""}
                  </strong>{" "}
                  pour ton Albom. Cette action est définitive.
                </p>
                {uncroppedSelectedCount > 0 ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-950">
                    <strong>Attention :</strong> {uncroppedSelectedCount} photo
                    {uncroppedSelectedCount > 1 ? "s n'ont" : " n'a"} pas été
                    recadrée{uncroppedSelectedCount > 1 ? "s" : ""}. Des zones
                    vides pourraient apparaître à l&apos;impression — pense à
                    les recadrer avant de confirmer.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Toutes tes photos sont prêtes. Tu peux confirmer
                    l&apos;envoi.
                  </p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={uploading}
            >
              Annuler
            </Button>
            <Button type="button" onClick={submitSelection} disabled={uploading}>
              {uploading ? (
                <>
                  <UpdateIcon className="mr-2 size-4 animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                "Confirmer l'envoi"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
