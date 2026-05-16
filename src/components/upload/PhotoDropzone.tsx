"use client"

import { useCallback, useState } from "react"
import { UploadIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

type Props = {
  onFiles: (files: File[]) => void
  disabled?: boolean
}

export function PhotoDropzone({ onFiles, disabled }: Props) {
  const [dragging, setDragging] = useState(false)

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
        disabled && "pointer-events-none opacity-50"
      )}
      onClick={() => !disabled && document.getElementById("dropzone-input")?.click()}
    >
      <UploadIcon className="size-10 text-muted-foreground" />
      <p className="text-sm font-medium">Glissez vos photos ici ou cliquez</p>
      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP, TIFF, HEIC — 50 Mo max
      </p>
      <input
        id="dropzone-input"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/tiff,image/heic,image/heif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
