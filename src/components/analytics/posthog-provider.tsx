"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import {
  isAnalyticsConfigured,
  isTrackingExcluded,
  loadAnalytics,
  syncSessionRecording,
} from "@/lib/analytics"

import { CookieBanner } from "./cookie-banner"

export function PostHogProvider(): JSX.Element | null {
  const pathname = usePathname()
  const [isReady, setIsReady] = React.useState(false)

  React.useEffect(() => {
    if (!isAnalyticsConfigured()) return
    if (isTrackingExcluded(pathname)) return

    let isCurrent = true
    void loadAnalytics().then((posthog) => {
      if (isCurrent && posthog) setIsReady(true)
    })
    return () => {
      isCurrent = false
    }
  }, [pathname])

  React.useEffect(() => {
    if (!isReady) return
    void syncSessionRecording(pathname)
  }, [isReady, pathname])

  if (!isReady) return null

  return <CookieBanner />
}
