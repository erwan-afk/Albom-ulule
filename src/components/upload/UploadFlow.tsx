"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { confirmUpload } from "@/actions/order"
import { deleteUploadedFile, uploadFile } from "@/actions/upload"
import {
  CheckCircledIcon,
  CrossCircledIcon,
  TrashIcon,
  UpdateIcon,
} from "@radix-ui/react-icons"

import type { PhotoProductConfig } from "@/lib/shopify/productMetafields"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  const objectUrlsRef = useRef<Set<string>>(new Set())

  const cropTarget = sidebarPhotos.find((p) => p.id === cropTargetId) ?? null

  const photosRequired = config.photosRequired

  const selectedCount = sidebarPhotos.filter((p) => p.selected).length

  // Charger les fichiers déjà uploadés côté serveur
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

  // Nettoyage des URLs objet
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
      objectUrlsRef.current.clear()
    }
  }, [])

  // --- Ajout de fichiers (depuis dropzone) ---
  const handleAddFiles = useCallback((files: File[]) => {
    const newPhotos: SidebarPhoto[] = files.map((file) => {
      const id = crypto.randomUUID()
      const url = URL.createObjectURL(file)
      objectUrlsRef.current.add(url)
      return {
        id,
        previewUrl: url,
        status: "ready",
        selected: false,
      }
    })
    setSidebarPhotos((prev) => [...prev, ...newPhotos])
  }, [])

  // --- Toggle sélection ---
  const handleToggleSelect = useCallback(
    (id: string) => {
      setSidebarPhotos((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          if (p.selected) return { ...p, selected: false }
          if (selectedCount >= photosRequired) return p
          return { ...p, selected: true }
        })
      )
    },
    [selectedCount, photosRequired]
  )

  // --- Suppression ---
  const handleRemove = useCallback((id: string) => {
    setSidebarPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target && objectUrlsRef.current.has(target.previewUrl)) {
        URL.revokeObjectURL(target.previewUrl)
        objectUrlsRef.current.delete(target.previewUrl)
      }
      return prev.filter((p) => p.id !== id)
    })
  }, [])

  // --- Confirmer et uploader ---
  const handleConfirm = async () => {
    setUploading(true)

    // Uploader toutes les photos sélectionnées (sauf celles déjà en erreur)
    const selected = sidebarPhotos.filter(
      (p) => p.selected && p.status !== "error" && p.status !== "uploading"
    )
    for (const photo of selected) {
      setSidebarPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, status: "uploading" } : p))
      )

      try {
        const rawBlob =
          photo.cropBlob ??
          (await fetch(photo.previewUrl).then((r) => r.blob()))
        if (!rawBlob) continue
        const file = new File([rawBlob], `photo-${photo.id.slice(0, 8)}.jpg`, {
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

    // Confirmer la commande
    await confirmUpload(token)
    setConfirmed(true)
    await fetchOrder()
    setUploading(false)
  }

  // Supprimer un fichier serveur
  const handleDeleteServerFile = async (fileId: string) => {
    await deleteUploadedFile(fileId, token)
    await fetchOrder()
  }

  // --- Crop ---
  const handleCropConfirm = (blob: Blob) => {
    if (!cropTarget) return
    const cropPreviewUrl = URL.createObjectURL(blob)
    objectUrlsRef.current.add(cropPreviewUrl)

    setSidebarPhotos((prev) =>
      prev.map((p) =>
        p.id === cropTarget.id
          ? { ...p, cropBlob: blob, cropPreviewUrl, status: "ready" as const }
          : p
      )
    )
    setCropTargetId(null)
  }

  // Loading
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <UpdateIcon className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error
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
    sidebarPhotos.filter((p) => p.selected && p.status !== "ready").length === 0

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b px-6 py-3">
        <div>
          <h1 className="text-lg font-semibold">
            {confirmed ? "✅ Photos déposées" : productTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {photosRequired} photo{photosRequired > 1 ? "s" : ""} requise
            {photosRequired > 1 ? "s" : ""} · Ratio {config.ratioLabel}
          </p>
        </div>
        {confirmed && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
            <CheckCircledIcon className="size-3.5" />
            Terminé
          </span>
        )}
      </header>

      {/* Barre progression */}
      {!confirmed && (
        <div className="flex items-center gap-3 border-b px-6 py-2">
          <div className="flex-1 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{
                width: `${Math.min(100, (selectedCount / photosRequired) * 100)}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium tabular-nums">
            {selectedCount}/{photosRequired}
          </span>
          {selectedCount < photosRequired && (
            <span className="text-xs text-muted-foreground">
              Sélectionnez vos photos dans la barre latérale
            </span>
          )}
        </div>
      )}

      {/* Layout sidebar + centre */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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

        {/* Zone centrale */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {confirmed ? (
              /* État confirmé */
              <div className="mx-auto max-w-md rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950">
                <CheckCircledIcon className="mx-auto mb-4 size-12 text-green-500" />
                <h2 className="text-xl font-semibold text-green-700 dark:text-green-300">
                  Photos réceptionnées
                </h2>
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  Vous allez recevoir un e-mail de confirmation. Votre commande
                  est en cours de traitement.
                </p>

                {/* Fichiers uploadés */}
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
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {(f.sizeBytes / (1024 * 1024)).toFixed(1)} Mo
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              /* Grille des photos sélectionnées */
              <>
                {selectedCount === 0 && sidebarPhotos.length === 0 && (
                  <div className="flex min-h-[400px] items-center justify-center text-center">
                    <div>
                      <h2 className="text-xl font-bold">{productTitle}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Ajoutez vos photos puis sélectionnez-en {photosRequired}{" "}
                        au format {config.ratioLabel}.
                      </p>
                    </div>
                  </div>
                )}

                {selectedCount === 0 &&
                  sidebarPhotos.length > 0 &&
                  !confirmed && (
                    <div className="flex min-h-[400px] items-center justify-center text-center text-sm text-muted-foreground">
                      Cliquez sur une photo dans la barre latérale pour la
                      sélectionner
                    </div>
                  )}

                {/* Grille */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {sidebarPhotos
                    .filter((p) => p.selected)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="group relative aspect-[3/2] overflow-hidden rounded-lg border bg-muted"
                      >
                        <img
                          src={p.cropPreviewUrl ?? p.previewUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                        {/* Overlay d'actions au survol */}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                          {/* Bouton recadrer */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCropTargetId(p.id)
                            }}
                            className="rounded-full bg-white/90 p-2 text-foreground shadow-lg hover:bg-white"
                            title="Recadrer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="size-4"
                            >
                              <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                              <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                            </svg>
                          </button>
                          {/* Bouton désélectionner */}
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(p.id)}
                            className="rounded-full bg-white/90 p-2 text-destructive shadow-lg hover:bg-white"
                            title="Désélectionner"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                        {p.status === "uploading" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <UpdateIcon className="size-6 animate-spin text-white" />
                          </div>
                        )}
                        {p.status === "error" && (
                          <div className="absolute bottom-0 left-0 right-0 bg-destructive/80 px-2 py-1 text-[10px] text-white">
                            {p.error || "Erreur"}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Fichiers déjà sur le serveur */}
                {serverFiles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-semibold">
                      Fichiers déjà envoyés
                    </h3>
                    <ul className="space-y-1.5">
                      {serverFiles.map((f) => (
                        <li
                          key={f.id}
                          className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <CheckCircledIcon className="size-4 shrink-0 text-green-500" />
                            <span className="truncate text-sm">
                              {f.originalName}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {(f.sizeBytes / (1024 * 1024)).toFixed(1)} Mo
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() => handleDeleteServerFile(f.id)}
                          >
                            <TrashIcon className="size-4 text-destructive" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bouton confirmer */}
                {selectedCount > 0 && allReady && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      size="lg"
                      onClick={handleConfirm}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <UpdateIcon className="mr-2 size-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        `✅ Confirmer l'envoi (${selectedCount} photo${selectedCount > 1 ? "s" : ""})`
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Cropper modal */}
        {cropTarget && (
          <PhotoCropper
            imageSrc={cropTarget.previewUrl}
            ratio={config.ratioValue}
            onCancel={() => setCropTargetId(null)}
            onConfirm={handleCropConfirm}
          />
        )}
      </div>
    </div>
  )
}
