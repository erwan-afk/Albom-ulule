"use client"

import {
  CheckCircledIcon,
  CrossCircledIcon,
  UpdateIcon,
} from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

import { ScrollArea } from "@/components/ui/scroll-area"
import { PhotoDropzone } from "@/components/upload/PhotoDropzone"

export type SidebarPhoto = {
  id: string
  previewUrl: string
  cropBlob?: Blob
  cropPreviewUrl?: string
  status: "pending" | "cropping" | "uploading" | "ready" | "error"
  error?: string
  selected: boolean
}

type Props = {
  photos: SidebarPhoto[]
  selectedCount: number
  maxSelect: number
  onToggleSelect: (id: string) => void
  onRemove: (id: string) => void
  onAddFiles: (files: File[]) => void
  disabled?: boolean
}

export function PhotoSidebar({
  photos,
  selectedCount,
  maxSelect,
  onToggleSelect,
  onRemove,
  onAddFiles,
  disabled,
}: Props) {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r bg-muted/30">
      {/* Dropzone en haut */}
      <div className="p-4">
        <PhotoDropzone onFiles={onAddFiles} disabled={disabled} />
      </div>

      {/* Liste des photos */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 px-3 pb-4">
          {photos.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              Ajoutez des photos ci-dessus
            </p>
          )}
          {photos.map((p) => (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                p.selected && "bg-primary/5 ring-2 ring-primary",
                p.status === "ready" &&
                  !p.selected &&
                  "ring-1 ring-green-400/50",
                p.status === "error" && "ring-1 ring-destructive/50"
              )}
            >
              {/* Miniature cliquable pour sélection */}
              <button
                type="button"
                onClick={() => onToggleSelect(p.id)}
                disabled={disabled}
                className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted"
              >
                <img
                  src={p.cropPreviewUrl ?? p.previewUrl}
                  alt=""
                  className="size-full object-cover"
                />
                {/* Badge statut */}
                <span className="absolute bottom-0.5 right-0.5">
                  {p.status === "ready" && (
                    <CheckCircledIcon className="size-3.5 text-green-500" />
                  )}
                  {p.status === "cropping" && (
                    <UpdateIcon className="size-3.5 animate-spin text-primary" />
                  )}
                  {p.status === "uploading" && (
                    <UpdateIcon className="size-3.5 animate-spin text-primary" />
                  )}
                  {p.status === "error" && (
                    <CrossCircledIcon className="size-3.5 text-destructive" />
                  )}
                </span>
              </button>

              {/* Infos + actions */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  Photo {p.id.slice(0, 4)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {p.status === "pending" && "En attente"}
                  {p.status === "cropping" && "Recadrage…"}
                  {p.status === "uploading" && "Upload…"}
                  {p.status === "ready" && "Vérifiée ✓"}
                  {p.status === "error" && (p.error || "Erreur")}
                </p>
              </div>

              {/* Bouton supprimer */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(p.id)
                }}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer : compteur */}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground">
        {selectedCount}/{maxSelect} sélectionnée{maxSelect > 1 ? "s" : ""}
      </div>
    </aside>
  )
}
