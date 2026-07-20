"use client"

import { useCallback, useId, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { UploadPhotosIcon } from "@/components/upload/UploadPhotosIcon"

type Props = {
  onFiles: (files: File[]) => void
  disabled?: boolean
  variant?: "default" | "tile"
  aspectRatio?: number
  className?: string
}

export function PhotoDropzone({
  onFiles,
  disabled,
  variant = "default",
  aspectRatio = 74 / 105,
  className,
}: Props): JSX.Element {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const isTile = variant === "tile"

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (disabled) return
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      )
      if (files.length > 0) onFiles(files)
    },
    [disabled, onFiles]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFiles(Array.from(files))
      e.target.value = ""
    }
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  if (isTile) {
    return (
      <div
        className={cn(
          "flex w-full max-w-[180px] flex-col items-center",
          className
        )}
      >
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={openPicker}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (disabled) return
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              openPicker()
            }
          }}
          className={cn(
            "w-full cursor-pointer rounded-sm border-2 border-dashed bg-white/60 p-1.5 transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/20",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <div
            className="flex flex-col items-center justify-center gap-2 px-2"
            style={{ aspectRatio }}
          >
            <UploadPhotosIcon className="size-10 shrink-0" />
            <p className="text-center text-sm font-semibold leading-tight">
              Ajouter des photos
            </p>
            <p className="text-center text-xs leading-snug text-muted-foreground">
              JPG · PNG · HEIC
              <br />
              10 Mo max par fichier
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/tiff,image/heic,image/heif"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 transition-colors",
        dragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/20",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={openPicker}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          openPicker()
        }
      }}
    >
      <UploadPhotosIcon className="size-14" />
      <div className="text-center">
        <p className="font-display text-[28px] font-bold leading-none tracking-[-0.04em]">
          Glisse tes photos ici ou importe-les
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          JPG, PNG, HEIC — 10 Mo max
        </p>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/tiff,image/heic,image/heif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
