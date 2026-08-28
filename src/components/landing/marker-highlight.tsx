import { cn } from "@/lib/utils"

type MarkerColor = "maya" | "beurre" | "brun" | "blanc" | "noir"

type MarkerHighlightProps = {
  children: React.ReactNode
  className?: string
  /**
   * Couleur du feutre. `maya` = bleu, `beurre` = jaune, `brun` = trait plus marqué.
   */
  color?: MarkerColor
  /**
   * `marker` : surlignage type Stabilo.
   * `brush` : tache plus irrégulière, côté fait-main.
   */
  variant?: "marker" | "brush"
}

const PALETTE: Record<MarkerColor, string> = {
  maya: "#C0DFFF",
  beurre: "#F8F5CA",
  brun: "#673A36",
  blanc: "#F9F9F4",
  noir: "#000000",
}

/**
 * Tache de feutre pleine — bords mâchés, pas un trait lissé.
 * (Les coups de stroke type Stabilo se lisent comme un ver une fois étirés.)
 */
const MARKER_PATH =
  "M6.0 62.0 C 6.0 53.9, 11.5 41.9, 16.0 37.7 C 20.5 33.5, 27.5 37.7, 33.2 36.8 C 38.9 35.9, 44.6 33.4, 50.4 32.1 C 56.1 30.9, 61.8 27.9, 67.5 29.2 C 73.3 30.5, 79.0 39.0, 84.7 39.9 C 90.5 40.8, 96.2 36.1, 101.9 34.5 C 107.6 32.9, 113.4 30.6, 119.1 30.3 C 124.8 29.9, 130.5 30.7, 136.3 32.4 C 142.0 34.1, 147.7 40.5, 153.5 40.4 C 159.2 40.2, 164.9 33.2, 170.6 31.5 C 176.4 29.8, 182.1 29.6, 187.8 30.3 C 193.5 31.1, 199.3 34.4, 205.0 35.8 C 210.7 37.2, 216.5 39.9, 222.2 38.8 C 227.9 37.7, 233.6 30.1, 239.4 29.0 C 245.1 28.0, 250.8 30.8, 256.5 32.3 C 262.3 33.8, 268.0 37.6, 273.7 38.1 C 279.5 38.7, 285.2 37.3, 290.9 35.7 C 296.6 34.0, 302.4 28.3, 308.1 28.2 C 313.8 28.1, 319.5 33.5, 325.3 35.2 C 331.0 36.9, 336.7 39.0, 342.5 38.5 C 348.2 38.0, 353.9 33.7, 359.6 32.2 C 365.4 30.6, 371.1 28.5, 376.8 29.4 C 382.5 30.3, 389.5 32.8, 394.0 37.8 C 398.5 42.8, 404.0 52.1, 404.0 59.3 C 404.0 66.4, 398.5 78.3, 394.0 80.7 C 389.5 83.2, 382.5 73.2, 376.8 74.0 C 371.1 74.8, 365.4 84.3, 359.6 85.5 C 353.9 86.7, 348.2 83.3, 342.5 81.3 C 336.7 79.2, 331.0 72.8, 325.3 73.4 C 319.5 73.9, 313.8 83.5, 308.1 84.8 C 302.4 86.0, 296.6 82.2, 290.9 80.9 C 285.2 79.7, 279.5 77.8, 273.7 77.4 C 268.0 77.0, 262.3 77.2, 256.5 78.5 C 250.8 79.7, 245.1 84.9, 239.4 84.9 C 233.6 84.9, 227.9 80.1, 222.2 78.4 C 216.5 76.7, 210.7 73.2, 205.0 74.7 C 199.3 76.3, 193.5 87.1, 187.8 87.6 C 182.1 88.0, 176.4 79.3, 170.6 77.4 C 164.9 75.6, 159.2 75.6, 153.5 76.6 C 147.7 77.6, 142.0 82.6, 136.3 83.4 C 130.5 84.2, 124.8 82.3, 119.1 81.3 C 113.4 80.2, 107.6 77.5, 101.9 77.0 C 96.2 76.5, 90.5 76.7, 84.7 78.4 C 79.0 80.0, 73.3 87.5, 67.5 86.9 C 61.8 86.2, 56.1 75.9, 50.4 74.5 C 44.6 73.1, 38.9 76.5, 33.2 78.4 C 27.5 80.4, 20.5 89.0, 16.0 86.2 C 11.5 83.5, 6.0 70.0, 6.0 62.0 Z"

const BRUSH_PATH =
  "M6.0 71.5 C 6.0 61.3, 10.1 48.7, 16.0 41.0 C 21.9 33.2, 33.0 28.7, 41.5 25.0 C 50.0 21.2, 58.5 18.7, 67.0 18.3 C 75.5 17.9, 84.0 18.4, 92.5 22.3 C 101.0 26.3, 109.5 43.0, 118.0 42.2 C 126.5 41.3, 135.0 20.7, 143.5 17.1 C 152.0 13.4, 160.5 18.3, 169.0 20.3 C 177.5 22.3, 186.0 25.9, 194.5 29.0 C 203.0 32.0, 211.5 41.7, 220.0 38.7 C 228.5 35.7, 237.0 13.0, 245.5 11.0 C 254.0 8.9, 262.5 22.7, 271.0 26.3 C 279.5 29.9, 288.0 31.7, 296.5 32.6 C 305.0 33.6, 313.5 36.0, 322.0 32.0 C 330.5 28.1, 339.0 8.6, 347.5 8.9 C 356.0 9.2, 364.5 30.2, 373.0 34.0 C 381.5 37.8, 390.0 33.4, 398.5 31.8 C 407.0 30.3, 418.1 20.2, 424.0 24.9 C 429.9 29.7, 434.0 48.6, 434.0 60.4 C 434.0 72.2, 429.9 91.8, 424.0 95.9 C 418.1 99.9, 407.0 87.1, 398.5 84.6 C 390.0 82.1, 381.5 79.2, 373.0 80.9 C 364.5 82.5, 356.0 92.0, 347.5 94.4 C 339.0 96.9, 330.5 99.4, 322.0 95.4 C 313.5 91.4, 305.0 69.9, 296.5 70.4 C 288.0 70.9, 279.5 94.7, 271.0 98.6 C 262.5 102.5, 254.0 97.6, 245.5 93.8 C 237.0 90.0, 228.5 75.9, 220.0 75.5 C 211.5 75.2, 203.0 88.7, 194.5 91.8 C 186.0 94.8, 177.5 94.6, 169.0 93.7 C 160.5 92.8, 152.0 89.3, 143.5 86.5 C 135.0 83.7, 126.5 74.3, 118.0 76.9 C 109.5 79.5, 101.0 100.2, 92.5 101.9 C 84.0 103.7, 75.5 92.1, 67.0 87.4 C 58.5 82.7, 50.0 71.2, 41.5 73.6 C 33.0 76.1, 21.9 102.4, 16.0 102.0 C 10.1 101.7, 6.0 81.7, 6.0 71.5 Z"

function brushUri(hex: string, variant: "marker" | "brush") {
  const path = variant === "brush" ? BRUSH_PATH : MARKER_PATH
  const viewBox = variant === "brush" ? "0 0 440 110" : "0 0 410 100"
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="none"><path fill="${hex}" d="${path}"/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

/**
 * Surlignage au feutre derrière un mot ou une phrase.
 * Le fond SVG se clone à chaque ligne (`box-decoration-break`) pour rester
 * collé au texte, y compris quand le titre revient à la ligne.
 */
export function MarkerHighlight({
  children,
  className,
  color = "maya",
  variant = "marker",
}: MarkerHighlightProps) {
  return (
    <span
      className={cn(
        "box-decoration-clone [-webkit-box-decoration-break:clone]",
        variant === "brush" ? "px-[0.34em] py-[0.12em]" : "px-[0.18em] py-[0.04em]",
        className
      )}
      style={{
        backgroundImage: brushUri(PALETTE[color], variant),
        backgroundRepeat: "no-repeat",
        backgroundSize: variant === "brush" ? "100% 108%" : "100% 82%",
        backgroundPosition: variant === "brush" ? "center center" : "center 72%",
      }}
    >
      {children}
    </span>
  )
}
