import type { ReactNode } from "react"

import { UploadShell } from "@/components/upload/UploadShell"

export default function UploadLayout({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  return <UploadShell>{children}</UploadShell>
}
