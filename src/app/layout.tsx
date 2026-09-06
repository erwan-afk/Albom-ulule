import "@/styles/globals.css"

import * as React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/react"

import { env } from "@/env.mjs"
import { fontAlbertSans, fontDisplay } from "@/config/fonts"
import { siteConfig } from "@/config/site"

import { cn } from "@/lib/utils"

import { TailwindIndicator } from "@/components/tailwind-indicator"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F9F4" },
    { media: "(prefers-color-scheme: dark)", color: "#673A36" },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: `${siteConfig.name} — ${siteConfig.shortDescription}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  authors: [
    {
      name: siteConfig.author,
      url: siteConfig.links.authorsWebsite,
    },
  ],
  creator: siteConfig.author,
  keywords: siteConfig.keywords,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.shortDescription}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [siteConfig.links.openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.shortDescription}`,
    description: siteConfig.description,
    images: [siteConfig.links.openGraphImage],
    creator: siteConfig.author,
  },
  icons: {
    icon: "/favicon.ico",
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="fr" className="overflow-x-hidden overflow-y-scroll">
      <body
        className={cn(
          "w-full bg-background font-sans text-foreground antialiased",
          fontAlbertSans.variable,
          fontDisplay.variable
        )}
      >
        {children}
        <Analytics />
        <TailwindIndicator />
      </body>
    </html>
  )
}
