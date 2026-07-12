"use client"

import type { ReactNode } from "react"

import { BodyScrollLock } from "@/components/upload/BodyScrollLock"

type Props = {
  children: ReactNode
}

export function UploadShell({ children }: Props): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain bg-background [-webkit-overflow-scrolling:touch]"
      data-lenis-prevent
    >
      <BodyScrollLock />
      {children}
    </div>
  )
}
