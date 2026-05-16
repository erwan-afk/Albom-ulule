import fs from "node:fs"
import path from "node:path"

import type { TemplateConfig } from "./types"

// All template data lives under public/templates/{id}/
// config.json  — zone definitions + metadata
// overlay.pdf  — Illustrator clean layer (photo zones removed)
// background.pdf — raw PDF when no photo-* layers detected
const TEMPLATES_DIR = path.join(process.cwd(), "public/templates")

export interface TemplateListItem {
  id: string
  name: string
  zonesCount: number
  productKeywords: string[]
  hasBackground: boolean
  hasOverlay: boolean
  hasThumbnail: boolean
  updatedAt: number
}

function templateDir(id: string): string {
  return path.join(TEMPLATES_DIR, id)
}

function templateJsonPath(id: string): string {
  return path.join(TEMPLATES_DIR, id, "config.json")
}

function templatePdfPath(id: string, layer: "background" | "overlay"): string {
  return path.join(TEMPLATES_DIR, id, `${layer}.pdf`)
}

// ─── List ───

export function listTemplates(): TemplateListItem[] {
  if (!fs.existsSync(TEMPLATES_DIR)) return []
  return fs
    .readdirSync(TEMPLATES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .flatMap((e) => {
      const cfgPath = path.join(TEMPLATES_DIR, e.name, "config.json")
      if (!fs.existsSync(cfgPath)) return []
      const config = JSON.parse(
        fs.readFileSync(cfgPath, "utf8")
      ) as TemplateConfig
      return [
        {
          id: config.id,
          name: config.name || config.id,
          zonesCount: (config.zones || []).length,
          productKeywords: config.productKeywords || [],
          hasBackground: fs.existsSync(
            templatePdfPath(config.id, "background")
          ),
          hasOverlay: fs.existsSync(templatePdfPath(config.id, "overlay")),
          hasThumbnail: hasThumbnail(config.id),
          updatedAt: (() => {
            try {
              return fs.statSync(cfgPath).mtimeMs
            } catch {
              return 0
            }
          })(),
        },
      ]
    })
}

// ─── Get ───

export function getTemplate(id: string): TemplateConfig | null {
  const filePath = templateJsonPath(id)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as TemplateConfig
}

// ─── PDF paths ───

export function getTemplatePdfPath(
  id: string,
  layer: "background" | "overlay"
): string | null {
  const pdfPath = templatePdfPath(id, layer)
  return fs.existsSync(pdfPath) ? pdfPath : null
}

// ─── Match product ───

export function findTemplateForProduct(
  productTitle: string,
  productGid?: string
): TemplateConfig | null {
  const title = (productTitle || "").toLowerCase()
  const templates = listTemplates()

  // Priority 1: match by Shopify product GID
  if (productGid) {
    for (const t of templates) {
      if (t.id === "default") continue
      const cfg = getTemplate(t.id)
      if (cfg?.productIds?.includes(productGid)) {
        console.info(
          `[pdf] Product "${productTitle}" matched template "${t.id}" (id: ${productGid})`
        )
        return cfg
      }
    }
  }

  // Priority 2: match by keyword (legacy fallback)
  for (const t of templates) {
    if (t.id === "default") continue
    for (const keyword of t.productKeywords) {
      if (keyword && title.includes(keyword.toLowerCase())) {
        console.info(
          `[pdf] Product "${productTitle}" matched template "${t.id}" (keyword: "${keyword}")`
        )
        return getTemplate(t.id)
      }
    }
  }

  const defaultTemplate = getTemplate("default")
  if (defaultTemplate) {
    console.info(`[pdf] Product "${productTitle}" using default template`)
    return defaultTemplate
  }

  return null
}

// ─── Save ───

export function saveTemplate(config: TemplateConfig): void {
  if (!config.id) throw new Error("Template ID is required")
  config.id = config.id.replace(/[^a-zA-Z0-9_-]/g, "")
  fs.mkdirSync(templateDir(config.id), { recursive: true })
  fs.writeFileSync(templateJsonPath(config.id), JSON.stringify(config, null, 2))
  console.info(
    `[pdf] Template saved: ${config.id} (${(config.zones || []).length} zones)`
  )
}

// ─── Save PDF layer ───

export function saveTemplatePdf(
  id: string,
  layer: "background" | "overlay",
  buffer: Buffer
): void {
  fs.mkdirSync(templateDir(id), { recursive: true })
  fs.writeFileSync(templatePdfPath(id, layer), buffer)
  console.info(
    `[pdf] Template ${layer} PDF saved: ${id} (${(buffer.length / 1024).toFixed(0)} KB)`
  )
}

// ─── Thumbnail ───

function templateThumbPath(id: string): string {
  return path.join(TEMPLATES_DIR, id, "thumbnail.png")
}

export function hasThumbnail(id: string): boolean {
  return fs.existsSync(templateThumbPath(id))
}

export function getThumbnailPath(id: string): string | null {
  const p = templateThumbPath(id)
  return fs.existsSync(p) ? p : null
}

export async function generateThumbnail(id: string): Promise<boolean> {
  const overlayPath = getTemplatePdfPath(id, "overlay")
  const bgPath = getTemplatePdfPath(id, "background")
  const pdfPath = overlayPath || bgPath
  if (!pdfPath) return false

  const pdfBuffer = fs.readFileSync(pdfPath)

  // Try sharp first (fast, native)
  try {
    const sharp = (await import("sharp")).default as any
    await sharp(pdfBuffer, { page: 0, density: 72 })
      .resize(300, 424, {
        fit: "inside",
        background: { r: 255, g: 255, b: 255 },
      })
      .png()
      .toFile(templateThumbPath(id))
    console.info(`[pdf] Thumbnail generated (sharp) for template: ${id}`)
    return true
  } catch (sharpErr) {
    console.warn(
      `[pdf] sharp thumbnail failed, trying pdfjs fallback: ${(sharpErr as Error).message}`
    )
  }

  // Fallback: pdfjs-dist + canvas
  try {
    const thumb = await renderThumbnailWithPdfjs(pdfBuffer)
    fs.writeFileSync(templateThumbPath(id), thumb)
    console.info(`[pdf] Thumbnail generated (pdfjs) for template: ${id}`)
    return true
  } catch (err) {
    console.error(`[pdf] Thumbnail error for ${id}: ${(err as Error).message}`)
    return false
  }
}

async function renderThumbnailWithPdfjs(pdfBuffer: Buffer): Promise<Buffer> {
  const { createCanvas } = await import("canvas")
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
    useWorkerFetch: false,
    useSystemFonts: true,
  })
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 1 })

  const width = 300
  const scale = width / viewport.width
  const height = Math.floor(viewport.height * scale)

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  await page.render({
    canvas: canvas as unknown as HTMLCanvasElement,
    canvasContext: ctx as unknown as CanvasRenderingContext2D,
    viewport: page.getViewport({ scale }),
  } as any).promise

  await pdf.destroy()
  return canvas.toBuffer("image/png")
}

// ─── Delete ───

export function deleteTemplate(id: string): void {
  const dir = templateDir(id)
  if (!fs.existsSync(dir)) return

  // Delete individual files first (avoids locked file issues on Windows)
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isFile()) {
      const fp = path.join(dir, entry.name)
      try {
        fs.unlinkSync(fp)
      } catch {
        // ignore locked files
      }
    }
  }

  // Then try to remove the directory
  try {
    fs.rmdirSync(dir)
  } catch {
    // If we can't remove (e.g. Windows lock), rename it out of the way
    try {
      const deadDir = dir + ".deleted." + Date.now()
      fs.renameSync(dir, deadDir)
    } catch {
      // Last resort: clear contents and leave dir
    }
  }

  console.info(`[pdf] Template deleted: ${id}`)
}
