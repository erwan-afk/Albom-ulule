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
import { formatRatioDisplay } from "@/lib/upload/ratio"

import { Button } from "@/components/ui/button"
import { PhotoCropper } from "@/components/upload/PhotoCropper"
import {
  PhotoSidebar,
  type SidebarPhoto,
} from "@/components/upload/PhotoSidebar"

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
  productTitle,
  token,
  config,
}: UploadFlowProps): JSX.Element {
  const [serverFiles, setServerFiles] = useState<ServerFile[]>([])
  const [sidebarPhotos, setSidebarPhotos] = useState<SidebarPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cropTargetId, setCropTargetId] = useState<string | null>(null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set())

  const cropTarget = sidebarPhotos.find((p) => p.id === cropTargetId) ?? null

  const photosRequired = config.photosRequired
  const ratioDisplay = formatRatioDisplay(config.ratioLabel)
  /** Ratio largeur/hauteur du cadre (74×105 mm → portrait ~0.705) */
  const frameAspect =
    config.photoRatio === "free" ? 74 / 105 : config.ratioValue

  const selectedPhotos = useMemo(
    () => sidebarPhotos.filter((p) => p.selected),
    [sidebarPhotos]
  )
  const selectedCount = selectedPhotos.length

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

      setSidebarPhotos((prev) => [...prev, ...placeholders])

      void (async () => {
        for (const placeholder of placeholders) {
          try {
            const { sourceFile, thumbUrl } = await createPreviewThumbnail(
              placeholder.file,
              480
            )
            trackUrl(thumbUrl)

            setSidebarPhotos((prev) =>
              prev.map((p) =>
                p.id === placeholder.id
                  ? {
                      ...p,
                      previewUrl: thumbUrl,
                      sourceFile,
                      status: "ready" as const,
                    }
                  : p
              )
            )
          } catch (err) {
            console.error("[UploadFlow] preview failed:", err)
            setSidebarPhotos((prev) =>
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
      setSidebarPhotos((prev) => {
        const currentSelected = prev.filter((p) => p.selected).length
        return prev.map((p) => {
          if (p.id !== id) return p
          if (p.selected) return { ...p, selected: false }
          if (currentSelected >= photosRequired) return p
          return { ...p, selected: true }
        })
      })
    },
    [photosRequired]
  )

  const handleRemove = useCallback(
    (id: string) => {
      if (cropTargetId === id) {
        setCropTargetId(null)
        if (cropImageSrc) revokeUrl(cropImageSrc)
        setCropImageSrc(null)
      }
      setSidebarPhotos((prev) => {
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
      const photo = sidebarPhotos.find((p) => p.id === id)
      if (!photo?.sourceFile) return
      if (cropImageSrc) revokeUrl(cropImageSrc)
      const url = trackUrl(createFullPreviewUrl(photo.sourceFile))
      setCropImageSrc(url)
      setCropTargetId(id)
    },
    [sidebarPhotos, cropImageSrc, revokeUrl, trackUrl]
  )

  const closeCropper = useCallback(() => {
    setCropTargetId(null)
    if (cropImageSrc) {
      revokeUrl(cropImageSrc)
      setCropImageSrc(null)
    }
  }, [cropImageSrc, revokeUrl])

  const handleConfirm = async () => {
    setUploading(true)

    const selected = sidebarPhotos.filter(
      (p) => p.selected && p.status !== "error" && p.status !== "uploading"
    )

    for (const photo of selected) {
      setSidebarPhotos((prev) =>
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
        setSidebarPhotos((prev) =>
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
        setSidebarPhotos((prev) =>
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

  const handleCropConfirm = (blob: Blob) => {
    if (!cropTarget) return
    const cropPreviewUrl = trackUrl(URL.createObjectURL(blob))

    setSidebarPhotos((prev) =>
      prev.map((p) =>
        p.id === cropTarget.id
          ? { ...p, cropBlob: blob, cropPreviewUrl, status: "ready" as const }
          : p
      )
    )
    closeCropper()
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <UpdateIcon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <CrossCircledIcon className="size-16 text-destructive" />
        <h1 className="text-2xl font-bold">Lien invalide</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  const allReady =
    selectedCount >= photosRequired &&
    selectedPhotos.every((p) => p.status === "ready")

  const confirmLabel = uploading
    ? "Génération du PDF…"
    : selectedCount >= photosRequired
      ? `Confirmer l'envoi (${selectedCount})`
      : `Confirmer (${selectedCount}/${photosRequired})`

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">
            {confirmed ? "Photos déposées" : productTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {photosRequired} photo{photosRequired > 1 ? "s" : ""} · Format{" "}
            {ratioDisplay}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!confirmed && (
            <Button
              size="sm"
              className="sm:size-default"
              onClick={handleConfirm}
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
        <div className="flex shrink-0 items-center gap-3 border-b px-4 py-2 sm:px-6">
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

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {!confirmed && (
          <PhotoSidebar
            photos={sidebarPhotos}
            selectedCount={selectedCount}
            maxSelect={photosRequired}
            onToggleSelect={handleToggleSelect}
            onRemove={handleRemove}
            onAddFiles={handleAddFiles}
            disabled={confirmed}
          />
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
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
                        <span className="truncate text-sm">
                          {f.originalName}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <>
                {selectedCount === 0 && sidebarPhotos.length === 0 && (
                  <div className="flex min-h-[300px] items-center justify-center text-center">
                    <div>
                      <h2 className="text-xl font-bold">{productTitle}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Ajoute tes photos à gauche, sélectionne-en{" "}
                        {photosRequired} au format {ratioDisplay}.
                      </p>
                    </div>
                  </div>
                )}

                {selectedCount === 0 && sidebarPhotos.length > 0 && (
                  <div className="flex min-h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
                    Clique sur une photo à gauche pour la sélectionner
                  </div>
                )}

                {selectedCount > 0 && (
                  <>
                    <p className="mb-4 text-center text-xs text-muted-foreground">
                      Le cadre en pointillés = format final ({ratioDisplay}).
                      Ta photo entière est visible — rien n&apos;est coupé tant
                      que tu n&apos;as pas recadré.
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
                      {selectedPhotos.map((p) => (
                        <div key={p.id} className="flex flex-col items-center gap-1">
                          <div
                            className="group relative w-full max-w-[120px] overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/35 bg-muted/50"
                            style={{ aspectRatio: frameAspect }}
                          >
                            {p.previewUrl && (
                              <img
                                src={p.cropPreviewUrl ?? p.previewUrl}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="size-full object-contain"
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 opacity-0 transition-opacity group-hover:bg-black/25 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => openCropper(p.id)}
                                className="rounded-full bg-white/95 p-1.5 shadow"
                                title="Recadrer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="size-3.5"
                                >
                                  <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                                  <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleSelect(p.id)}
                                className="rounded-full bg-white/95 p-1.5 text-destructive shadow"
                                title="Retirer"
                              >
                                <TrashIcon className="size-3.5" />
                              </button>
                            </div>
                            {p.status === "uploading" && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <UpdateIcon className="size-5 animate-spin text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {serverFiles.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-2 text-sm font-semibold">
                      Déjà envoyées
                    </h3>
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
        </div>

        {cropTarget && cropImageSrc && (
          <PhotoCropper
            imageSrc={cropImageSrc}
            ratio={frameAspect}
            onCancel={closeCropper}
            onConfirm={handleCropConfirm}
          />
        )}
      </div>
    </div>
  )
}
