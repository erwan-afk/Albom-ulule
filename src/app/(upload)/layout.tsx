import type { Metadata } from "next"
import type { ReactNode } from "react"

import { noIndexRobots } from "@/config/seo"
import { UploadShell } from "@/components/upload/UploadShell"

export const metadata: Metadata = {
  robots: noIndexRobots,
}

export default function UploadLayout({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  return <UploadShell>{children}</UploadShell>
}
