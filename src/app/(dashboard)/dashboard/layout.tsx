import * as React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import {
  DEFAULT_UNAUTHENTICATED_REDIRECT,
  DEFAULT_UNAUTHORIZED_REDIRECT,
} from "@/config/defaults"
import { noIndexRobots } from "@/config/seo"

import auth from "@/lib/auth"

import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  robots: noIndexRobots,
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<JSX.Element> {
  const session = await auth()
  if (!session?.user) redirect(DEFAULT_UNAUTHENTICATED_REDIRECT)
  if (session.user.role !== "ADMIN") redirect(DEFAULT_UNAUTHORIZED_REDIRECT)

  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
