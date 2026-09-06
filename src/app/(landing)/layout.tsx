import * as React from "react"

import { Footer } from "@/components/landing/footer"
import { JsonLd } from "@/components/landing/json-ld"
import { UluleUrlProvider } from "@/components/landing/ulule-url-provider"
import { publicGraphJsonLd } from "@/lib/json-ld"
import { getUluleUrl } from "@/lib/site-settings"

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<JSX.Element> {
  const ululeUrl = await getUluleUrl()

  return (
    <div className="min-h-screen bg-blanc-casse text-brun antialiased">
      <JsonLd data={publicGraphJsonLd()} />
      <UluleUrlProvider url={ululeUrl}>
        {children}
        <Footer />
      </UluleUrlProvider>
    </div>
  )
}
