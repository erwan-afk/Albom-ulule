import * as React from "react"
import { redirect } from "next/navigation"

import {
  DEFAULT_UNAUTHORIZED_REDIRECT,
  DEFAULT_UNAUTHENTICATED_REDIRECT,
} from "@/config/defaults"

import auth from "@/lib/auth"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<JSX.Element> {
  const session = await auth()
  if (!session?.user) redirect(DEFAULT_UNAUTHENTICATED_REDIRECT)
  if (session.user.role !== "ADMIN") redirect(DEFAULT_UNAUTHORIZED_REDIRECT)

  return <div>{children}</div>
}
