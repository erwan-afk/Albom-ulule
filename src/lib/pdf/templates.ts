import { PRINT_RESOLUTION_DPI } from "@/lib/images/constants"
import { mkdir, readFile, readdir, unlink, writeFile } from "fs/promises"
import path from "path"

const TEMPLATES_DIR = path.join(process.cwd(), "data", "templates")
const PDFS_DIR = path.join(TEMPLATES_DIR, "pdfs")
const THUMBS_DIR = path.join(TEMPLATES_DIR, "thumbnails")

export interface TemplateZone {
  x: number
  y: number
  width: number
  height: number
  fitMode: "contain" | "cover" | "stretch"
  borderRadius?: number
}

export interface TemplateConfig {
  id: string
  name: string
  productKeywords: string[]
  resolutionDpi: number
  label: {
    enabled: boolean
    fontSize: number
    text: string
    y: number
    color: [number, number, number]
    align: "center" | "left" | "right"
  }
  zones: TemplateZone[]
  // runtime info (not persisted)
  hasBackground?: boolean
  hasOverlay?: boolean
  hasThumbnail?: boolean
  zonesCount?: number
  updatedAt?: number
}

async function ensureDirs() {
  await mkdir(TEMPLATES_DIR, { recursive: true })
  await mkdir(PDFS_DIR, { recursive: true })
  await mkdir(THUMBS_DIR, { recursive: true })
}

// ─── Default template ───

const DEFAULT_TEMPLATE: TemplateConfig = {
  id: "default",
  name: "Défaut",
  productKeywords: [],
  resolutionDpi: PRINT_RESOLUTION_DPI,
  label: {
    enabled: true,
    fontSize: 8,
    text: "{customerName} — {orderNumber}",
    y: 15,
    color: [0.3, 0.3, 0.3],
    align: "center",
  },
  zones: [],
}

function configPath(id: string) {
  return path.join(TEMPLATES_DIR, `${id}.json`)
}
function pdfPath(id: string) {
  return path.join(PDFS_DIR, `${id}.pdf`)
}
function thumbPath(id: string) {
  return path.join(THUMBS_DIR, `${id}.png`)
}

// ─── CRUD ───

export async function getTemplateConfig(
  id: string
): Promise<TemplateConfig | null> {
  await ensureDirs()
  try {
    const raw = await readFile(configPath(id), "utf-8")
    return JSON.parse(raw) as TemplateConfig
  } catch {
    if (id === "default") return { ...DEFAULT_TEMPLATE }
    return null
  }
}

export async function saveTemplateConfig(
  config: TemplateConfig
): Promise<void> {
  await ensureDirs()
  await writeFile(configPath(config.id), JSON.stringify(config, null, 2))
}

export async function deleteTemplateConfig(id: string): Promise<void> {
  await ensureDirs()
  try {
    await unlink(configPath(id))
  } catch {
    // ignore
  }
  // delete associated PDF and thumbnail
  try {
    await unlink(pdfPath(id))
  } catch {
    /* ok */
  }
  try {
    await unlink(thumbPath(id))
  } catch {
    /* ok */
  }
}

export async function listTemplates(): Promise<TemplateConfig[]> {
  await ensureDirs()
  try {
    const files = await readdir(TEMPLATES_DIR)
    const configs: TemplateConfig[] = []
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      try {
        const raw = await readFile(path.join(TEMPLATES_DIR, file), "utf-8")
        const cfg = JSON.parse(raw) as TemplateConfig
        configs.push(await enrichTemplate(cfg))
      } catch {
        // skip invalid
      }
    }
    if (!configs.some((c) => c.id === "default")) {
      configs.push(await enrichTemplate({ ...DEFAULT_TEMPLATE }))
    }
    return configs.sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return [await enrichTemplate({ ...DEFAULT_TEMPLATE })]
  }
}

async function enrichTemplate(
  cfg: TemplateConfig
): Promise<TemplateConfig> {
  const enriched = { ...cfg }
  try {
    await readFile(pdfPath(cfg.id))
    enriched.hasBackground = true
  } catch {
    enriched.hasBackground = false
  }
  try {
    await readFile(thumbPath(cfg.id))
    enriched.hasThumbnail = true
  } catch {
    enriched.hasThumbnail = false
  }
  enriched.zonesCount = enriched.zones.length
  return enriched
}

// ─── PDF & Thumbnail files ───

export async function saveTemplatePdf(
  id: string,
  buffer: Buffer
): Promise<void> {
  await ensureDirs()
  await writeFile(pdfPath(id), buffer)
}

export async function getTemplatePdf(
  id: string
): Promise<Buffer | null> {
  await ensureDirs()
  try {
    return await readFile(pdfPath(id))
  } catch {
    return null
  }
}

export async function saveTemplateThumbnail(
  id: string,
  buffer: Buffer
): Promise<void> {
  await ensureDirs()
  await writeFile(thumbPath(id), buffer)
}

export async function getTemplateThumbnail(
  id: string
): Promise<Buffer | null> {
  await ensureDirs()
  try {
    return await readFile(thumbPath(id))
  } catch {
    return null
  }
}

// ─── Helper: find template for a product title ───

export async function findTemplateForProduct(
  productTitle: string
): Promise<TemplateConfig | null> {
  const templates = await listTemplates()
  const title = productTitle.toLowerCase()
  for (const t of templates) {
    if (t.id === "default") continue
    for (const kw of t.productKeywords) {
      if (kw && title.includes(kw.toLowerCase())) return t
    }
  }
  return templates.find((t) => t.id === "default") ?? null
}
