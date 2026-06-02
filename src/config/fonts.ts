import { Albert_Sans, Inter, Urbanist } from "next/font/google"
import localFont from "next/font/local"

// ── Fontes historiques (auth / dashboard, à ne pas casser pour l'instant)
export const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const fontUrbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
})

export const fontHeading = localFont({
  src: "../../public/fonts/cal-sans-semi-bold.woff2",
  variable: "--font-heading",
})

// ── Albom brandboard
// Albert Sans : corps de texte, UI, microcopy, headings.
// (Remplace Public Sans depuis l'itération 2 du brandboard.)
export const fontAlbertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

// Burned Pancakes (fichiers OTF fournis).
// OTF est supporté par `next/font/local`; on garde les deux graisses.
export const fontDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/BurnedPancakes-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/BurnedPancakes-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
})
