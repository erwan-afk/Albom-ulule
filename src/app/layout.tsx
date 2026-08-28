import "@/styles/globals.css"
import "@/styles/mdx.css"

import * as React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/react"

import { env } from "@/env.mjs"
import {
  fontAlbertSans,
  fontDisplay,
  fontHeading,
  fontInter,
  fontUrbanist,
} from "@/config/fonts"
import { siteConfig } from "@/config/site"

import { SessionProvider } from "@/providers/session-provider"
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import { cn } from "@/lib/utils"

import { Toaster } from "@/components/ui/toaster"
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
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [siteConfig.links.openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
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
          fontDisplay.variable,
          fontInter.variable,
          fontUrbanist.variable,
          fontHeading.variable
        )}
      >
        <SmoothScrollProvider>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {children}
              <Toaster />
              <Analytics />
              <TailwindIndicator />
            </ThemeProvider>
          </SessionProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
