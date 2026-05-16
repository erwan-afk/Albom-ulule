import type { ReactNode } from "react"

import { BodyScrollLock } from "@/components/upload/BodyScrollLock"

export default function UploadLayout({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  return (
    <>
      <BodyScrollLock />
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        {children}
      </div>
    </>
  )
}
