"use client"

import { memo, type ReactNode } from "react"
import {
  CheckIcon,
  Cross2Icon,
  CrossCircledIcon,
} from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

import { PolaroidFrame } from "@/components/upload/PolaroidFrame"
import type { UploadPhoto } from "@/components/upload/uploadPhoto.types"
import { photoHasGapZones } from "@/lib/upload/photoFrame"

type Props = {
  photo: UploadPhoto
  frameAspect: number
  disabled?: boolean
  onToggleSelect: (id: string) => void
  onCrop: (id: string) => void
}

const actionBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-foreground shadow-md transition-colors hover:bg-white/90"

function CropIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
    </svg>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
  className,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button type="button" onClick={onClick} className={cn(actionBtn, className)}>
      {icon}
      {label}
    </button>
  )
}

export const PhotoGridTile = memo(function PhotoGridTile({
  photo: p,
  frameAspect,
  disabled,
  onToggleSelect,
  onCrop,
}: Props) {
  const isReady = p.status === "ready"
  const showSelect = !p.selected && isReady && !disabled
  const showDeselect = p.selected && isReady && !disabled
  const showCrop = p.selected && isReady && !disabled
  const hasActions = showSelect || showDeselect || showCrop
  const showGapWarning = photoHasGapZones(p, frameAspect)

  const iconClass = "size-3.5 shrink-0"

  const actions = (
    <>
      {showSelect && (
        <ActionButton
          icon={<CheckIcon className={iconClass} />}
          label="Sélectionner"
          onClick={() => onToggleSelect(p.id)}
        />
      )}
      {showDeselect && (
        <ActionButton
          icon={<Cross2Icon className={iconClass} />}
          label="Désélectionner"
          onClick={() => onToggleSelect(p.id)}
        />
      )}
      {showCrop && (
        <ActionButton
          icon={<CropIcon className={iconClass} />}
          label="Recadrer"
          onClick={() => onCrop(p.id)}
        />
      )}
    </>
  )

  return (
    <div
      className={cn(
        "group/tile flex flex-col items-center transition-all duration-200",
        !p.selected && "opacity-45 grayscale hover:opacity-70 hover:grayscale-[0.35]"
      )}
    >
      <div className="relative w-full max-w-[180px]">
        <PolaroidFrame
          previewUrl={p.cropPreviewUrl ?? p.previewUrl}
          aspectRatio={frameAspect}
          selected={p.selected}
          showGapWarning={showGapWarning}
          isUploading={p.status === "uploading"}
          isPending={p.status === "pending"}
        >
          {hasActions && (
            <div
              className={cn(
                "absolute inset-0 z-[3] hidden flex-col items-center justify-center gap-2 bg-black/30 md:flex",
                "opacity-0 transition-opacity group-hover/tile:opacity-100"
              )}
            >
              {actions}
            </div>
          )}
        </PolaroidFrame>

        {p.status === "error" && (
          <span className="absolute inset-0 z-[4] flex items-center justify-center bg-destructive/20">
            <CrossCircledIcon className="size-8 text-destructive" />
          </span>
        )}
      </div>

      {hasActions && (
        <div className="mt-2 flex w-full max-w-[180px] flex-col items-stretch gap-1.5 md:hidden">
          {showSelect && (
            <ActionButton
              icon={<CheckIcon className={iconClass} />}
              label="Sélectionner"
              onClick={() => onToggleSelect(p.id)}
              className="w-full"
            />
          )}
          {showDeselect && (
            <ActionButton
              icon={<Cross2Icon className={iconClass} />}
              label="Désélectionner"
              onClick={() => onToggleSelect(p.id)}
              className="w-full"
            />
          )}
          {showCrop && (
            <ActionButton
              icon={<CropIcon className={iconClass} />}
              label="Recadrer"
              onClick={() => onCrop(p.id)}
              className="w-full"
            />
          )}
        </div>
      )}
    </div>
  )
})
