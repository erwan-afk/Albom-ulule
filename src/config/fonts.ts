import { Albert_Sans } from "next/font/google"
import localFont from "next/font/local"

export const fontAlbertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

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
