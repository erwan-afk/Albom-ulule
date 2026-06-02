// Script one-shot pour extraire les visuels placeholders depuis le brandboard.
// Lance-le une fois, puis supprime/garde-le selon ton goût.
// Usage : node scripts/crop-brandboard.mjs
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, "..")

const source = path.join(
  "C:",
  "Users",
  "mattc",
  ".cursor",
  "projects",
  "c-Users-mattc-Desktop-Freelance-2026-WORKS-ALBOM-Albom-ulule",
  "assets",
  "c__Users_mattc_AppData_Roaming_Cursor_User_workspaceStorage_d268ce524fa6e95551a87b39783874d2_images_Bandboard-Albom-a32a2c23-89c7-4742-8f06-cbbe1eb54113.png"
)

const out = path.join(root, "public", "images", "brand")

// Brandboard 652 x 1024 — coordonnées calibrées à la main.
const crops = [
  // Hero principal : photo du haut (album en train d'être complété, vu de haut).
  // On coupe au-dessus du bandeau "CRÉATIVITÉ · SOUVENIRS · …".
  { name: "hero-craft.jpg", left: 0, top: 0, width: 652, height: 218 },

  // 2x2 photos en bas du brandboard.
  // Ligne 1
  { name: "lifestyle-1.jpg", left: 215, top: 666, width: 218, height: 178 },
  { name: "lifestyle-2.jpg", left: 433, top: 666, width: 219, height: 178 },
  // Ligne 2
  { name: "lifestyle-3.jpg", left: 215, top: 844, width: 218, height: 180 },
  { name: "lifestyle-4.jpg", left: 433, top: 844, width: 219, height: 180 },
]

await sharp(source).metadata() // sanity

await Promise.all(
  crops.map((c) =>
    sharp(source)
      .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(path.join(out, c.name))
      .then(() => console.log("✓", c.name))
  )
)

console.log("Done.")
