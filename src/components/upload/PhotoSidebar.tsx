"use client"

import { memo } from "react"
import {
  CheckCircledIcon,
  CrossCircledIcon,
  UpdateIcon,
} from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

import { PhotoDropzone } from "@/components/upload/PhotoDropzone"

export type SidebarPhoto = {
  id: string
  previewUrl: string
  sourceFile?: File
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

const SidebarPhotoRow = memo(function SidebarPhotoRow({
  photo: p,
  disabled,
  onToggleSelect,
  onRemove,
}: {
  photo: SidebarPhoto
  disabled?: boolean
  onToggleSelect: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2",
        p.selected && "bg-primary/5 ring-2 ring-primary",
        p.status === "ready" && !p.selected && "ring-1 ring-green-400/50",
        p.status === "error" && "ring-1 ring-destructive/50"
      )}
    >
      <button
        type="button"
        onClick={() => onToggleSelect(p.id)}
        disabled={disabled || p.status !== "ready"}
        className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted"
      >
        {p.previewUrl ? (
          <img
            src={p.cropPreviewUrl ?? p.previewUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted">
            <UpdateIcon className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <span className="absolute bottom-0.5 right-0.5">
          {p.status === "ready" && (
            <CheckCircledIcon className="size-3.5 text-green-500" />
          )}
          {p.status === "uploading" && (
            <UpdateIcon className="size-3.5 animate-spin text-primary" />
          )}
          {p.status === "error" && (
            <CrossCircledIcon className="size-3.5 text-destructive" />
          )}
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">Photo {p.id.slice(0, 4)}</p>
        <p className="text-[10px] text-muted-foreground">
          {p.status === "pending" && "Chargement…"}
          {p.status === "uploading" && "Envoi…"}
          {p.status === "ready" && "Prête"}
          {p.status === "error" && (p.error || "Erreur")}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(p.id)
        }}
        className="shrink-0 text-muted-foreground hover:text-destructive"
        aria-label="Retirer de la liste"
      >
        ×
      </button>
    </div>
  )
})

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
    <aside className="flex h-full min-h-0 w-[280px] shrink-0 flex-col border-r bg-muted/30">
      <div className="shrink-0 p-4">
        <PhotoDropzone onFiles={onAddFiles} disabled={disabled} />
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
        style={{ touchAction: "pan-y" }}
      >
        <div className="space-y-1 px-3 pb-4">
          {photos.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              Ajoutez des photos ci-dessus
            </p>
          )}
          {photos.map((p) => (
            <SidebarPhotoRow
              key={p.id}
              photo={p}
              disabled={disabled}
              onToggleSelect={onToggleSelect}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t px-4 py-2 text-xs text-muted-foreground">
        {selectedCount}/{maxSelect} sélectionnée{maxSelect > 1 ? "s" : ""}
      </div>
    </aside>
  )
}
