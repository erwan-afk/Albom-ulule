"use client"

import type { CSSProperties, ReactNode } from "react"
import { ExclamationTriangleIcon, UpdateIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const STRIPE_STYLE: CSSProperties = {
  backgroundColor: "#ffffff",
  backgroundImage: `repeating-linear-gradient(
    -45deg,
    #ffffff,
    #ffffff 5px,
    rgba(239, 68, 68, 0.45) 5px,
    rgba(239, 68, 68, 0.45) 6px
  )`,
}

type Props = {
  previewUrl: string
  aspectRatio: number
  selected?: boolean
  showGapWarning?: boolean
  className?: string
  children?: ReactNode
  isUploading?: boolean
  isPending?: boolean
}

export function PolaroidFrame({
  previewUrl,
  aspectRatio,
  selected = false,
  showGapWarning = false,
  className,
  children,
  isUploading,
  isPending,
}: Props): JSX.Element {
  return (
    <div className={cn("relative w-full max-w-[180px]", className)}>
      <div
        className={cn(
          "bg-white p-1.5 transition-all duration-200",
          selected
            ? "shadow-[0_4px_14px_rgba(0,0,0,0.18),0_2px_6px_rgba(0,0,0,0.1)]"
            : "shadow-[0_1px_4px_rgba(0,0,0,0.06)] opacity-45 grayscale group-hover/tile:opacity-70 group-hover/tile:grayscale-[0.35]"
        )}
      >
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio, ...STRIPE_STYLE }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="relative z-[1] size-full object-contain"
            />
          ) : isPending ? (
            <div className="flex size-full items-center justify-center bg-muted">
              <UpdateIcon className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          {isUploading && (
            <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black/40">
              <UpdateIcon className="size-6 animate-spin text-white" />
            </div>
          )}
        </div>
      </div>

      {showGapWarning && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="absolute right-2 top-2 z-[5] flex size-6 items-center justify-center rounded-full bg-beurre shadow-sm"
                aria-label="Recadrage à ajuster"
                onClick={(e) => e.stopPropagation()}
              >
                <ExclamationTriangleIcon className="size-4 text-black" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="max-w-[220px] border-none bg-brun px-3 py-2.5 text-sm leading-snug text-white"
            >
              Cette photo ne remplit pas tout le cadre. Les zones rouges
              disparaîtront après recadrage.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {children}
    </div>
  )
}
