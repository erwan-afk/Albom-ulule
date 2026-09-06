import * as React from "react"
import type { Metadata } from "next"

import { noIndexRobots } from "@/config/seo"

import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  robots: noIndexRobots,
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps): JSX.Element {
  return (
    <div className="flex h-auto min-h-screen w-full items-center justify-center">
      {children}
      <Toaster />
    </div>
  )
}
