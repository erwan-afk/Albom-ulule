import * as React from "react"
import { DM_Serif_Display, Public_Sans } from "next/font/google"

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-dm-serif",
})

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
})

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <div
      className={`${dmSerif.variable} ${publicSans.variable} min-h-screen bg-[#F7ECDD] text-[#492929] antialiased [font-family:var(--font-public-sans,ui-sans-serif,system-ui,sans-serif)]`}
    >
      {children}
    </div>
  )
}
