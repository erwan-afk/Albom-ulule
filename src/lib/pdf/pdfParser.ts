// @ts-nocheck -- regex-heavy parser, indexed access is guarded at runtime
import zlib from "node:zlib"

import type { ClipPathCommand, ParsePdfResult, TemplateZone } from "./types"

const PT_TO_MM = 25.4 / 72

function round(n: number): number {
  return Math.round(n * 10) / 10
}

// ─── Extract content stream from PDF buffer ───

function extractContentStream(buffer: Buffer, text: string): string | null {
  const streamPattern = /stream\r?\n/g
  let m: RegExpExecArray | null
  let streamCount = 0
  while ((m = streamPattern.exec(text)) !== null) {
    const start = m.index + m[0].length
    const end = text.indexOf("endstream", start)
    if (end === -1) continue
    streamCount++

    const raw = buffer.subarray(start, end)

    // Try uncompressed first (some PDFs don't compress content streams)
    try {
      const rawContent = raw.toString("utf8")
      if (rawContent.includes("BDC")) {
        console.info(`[pdf] Found BDC in uncompressed stream #${streamCount}`)
        return rawContent
      }
    } catch {
      /* not valid utf8, try compressed */
    }

    // Try zlib decompression
    try {
      const decoded = zlib.inflateSync(raw)
      const content = decoded.toString("utf8")
      if (content.includes("BDC")) {
        console.info(`[pdf] Found BDC in compressed stream #${streamCount}`)
        return content
      }
    } catch {
      /* skip */
    }
  }
  console.info(
    `[pdf] Scanned ${streamCount} stream(s), none contain BDC markers`
  )
  return null
}

/** Remplace les aplats noirs Illustrator (0 0 0 k / rg) par du blanc avant un `re f`. */
export function sanitizeBlackFillsInStream(stream: string): string {
  const lines = stream.split("\n")
  const out: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const isBlackFill =
      /^0\s+0\s+0\s+0?\s+k$/.test(trimmed) ||
      /^0\s+0\s+0\s+rg$/.test(trimmed) ||
      /^0\s+g$/.test(trimmed)

    if (isBlackFill && isBlackFillFollowedByRectFill(lines, i)) {
      out.push("1 1 1 rg")
      continue
    }
    out.push(lines[i])
  }

  return out.join("\n")
}

function isBlackFillFollowedByRectFill(
  lines: string[],
  colorIdx: number
): boolean {
  for (let j = colorIdx + 1; j < Math.min(colorIdx + 15, lines.length); j++) {
    const t = lines[j].trim()
    if (t.startsWith("/OC ") || t === "EMC") return false
    if (t === "f" || t === "f*") return true
    if (/re\s+f$/.test(t)) return true
    if (t === "re" && j + 1 < lines.length && lines[j + 1].trim() === "f") {
      return true
    }
    if (/^(S|s|B|b|n)$/.test(t)) return false
  }
  return false
}

export { extractContentStream as extractContentStreamFromPdf }

// ─── Extract page height from MediaBox ───

function extractPageHeight(text: string): number {
  const m = text.match(
    /\/MediaBox\s*\[\s*[\d.]+\s+[\d.]+\s+[\d.]+\s+([\d.]+)\s*\]/
  )
  return m ? parseFloat(m[1]) : 841.89
}

// ─── Extract zone from Bezier path (rounded rectangle) ───

function extractBezierZone(
  blockContent: string,
  pageHeight: number
): TemplateZone | null {
  const cmMatch = blockContent.match(
    /q\s+1\s+0\s+0\s+1\s+([\d.-]+)\s+([\d.-]+)\s+cm\s*([\s\S]*?)\s*Q/
  )
  if (!cmMatch) return null

  const tx = parseFloat(cmMatch[1])
  const ty = parseFloat(cmMatch[2])
  const pathContent = cmMatch[3]

  const coords: { x: number; y: number }[] = []

  for (const match of pathContent.matchAll(/([\d.-]+)\s+([\d.-]+)\s+m/g)) {
    coords.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) })
  }
  for (const match of pathContent.matchAll(/([\d.-]+)\s+([\d.-]+)\s+l/g)) {
    coords.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) })
  }
  for (const match of pathContent.matchAll(
    /([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+c/g
  )) {
    coords.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) })
    coords.push({ x: parseFloat(match[3]), y: parseFloat(match[4]) })
    coords.push({ x: parseFloat(match[5]), y: parseFloat(match[6]) })
  }

  if (coords.length === 0) return null

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  for (const p of coords) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }

  const absX = tx + minX
  const absY = ty + minY
  const w = maxX - minX
  const h = maxY - minY

  const commands: ClipPathCommand[] = []
  const allOps = pathContent.matchAll(/([\d.\s-]+?)\s+(m|l|c)\b/g)
  for (const op of allOps) {
    const args = op[1].trim().split(/\s+/).map(Number)
    commands.push({ op: op[2] as "m" | "l" | "c", args })
  }

  return {
    id: 0,
    x_mm: round(absX * PT_TO_MM),
    y_mm: round((pageHeight - absY - h) * PT_TO_MM),
    width_mm: round(w * PT_TO_MM),
    height_mm: round(h * PT_TO_MM),
    clipPath: { transform: { tx, ty }, commands },
  }
}

// ─── Main parse function ───

/**
 * Parses an Illustrator PDF to extract photo zones from named layers
 * AND creates a "clean" version of the PDF with photo placeholders removed.
 *
 * IMPORTANT: Export from Illustrator with:
 *   File → Save As → PDF
 *   ☑ Create Acrobat Layers from Top-Level Layers
 *   Layer names must match: photo-1, photo-2, photo_1, photo_2
 *   Optional branding text zone: info-1 (case logo + nom client, etc.)
 */
export function parsePdfTemplate(pdfBuffer: Buffer): ParsePdfResult {
  const text = pdfBuffer.toString("latin1")

  // Step 1: Map OCG objects to layer names
  const layers: Record<string, string> = {}
  const ocgPatterns = [
    /(\d+)\s+0\s+obj\s*<[^>]*\/Name\s*\(([^)]+)\)[^>]*\/Type\s*\/OCG/g,
    /(\d+)\s+0\s+obj\s*<[^>]*\/Type\s*\/OCG[^>]*\/Name\s*\(([^)]+)\)/g,
  ]
  for (const pat of ocgPatterns) {
    for (const m of text.matchAll(pat)) {
      if (!layers[m[1]]) {
        layers[m[1]] = m[2]
        console.info(`[pdf] PDF layer: "${m[2]}" (obj ${m[1]})`)
      }
    }
  }
  console.info(
    `[pdf] Found ${Object.keys(layers).length} OCG layer(s): ${JSON.stringify(layers)}`
  )

  // Step 2: Map MC names → layer names
  const mcToLayer: Record<string, string> = {}
  const propsPattern = /\/Properties\s*<<([^>]+)>>/g
  for (const m of text.matchAll(propsPattern)) {
    const mcPattern = /\/(MC\d+)\s+(\d+)\s+0\s+R/g
    for (const mcMatch of m[1].matchAll(mcPattern)) {
      if (layers[mcMatch[2]]) mcToLayer[mcMatch[1]] = layers[mcMatch[2]]
    }
  }
  console.info(`[pdf] MC mappings: ${JSON.stringify(mcToLayer)}`)

  // Step 3: Find the content stream
  const contentStream = extractContentStream(pdfBuffer, text)
  if (!contentStream) {
    console.warn(
      "[pdf] Could not extract PDF content stream. The PDF may not have OCG layers."
    )
    console.warn(
      "[pdf] In Illustrator: File → Save As → PDF → ☑ Create Acrobat Layers from Top-Level Layers"
    )
    return { zones: [], brandingZone: null, cleanContentStream: null, pageHeight: 841.89 }
  }

  // Step 4: Parse BDC/EMC blocks
  const zones: TemplateZone[] = []
  let brandingZone: TemplateZone | null = null
  const pageHeight = extractPageHeight(text)
  let cleanStream = contentStream
  const bdcPattern = /\/OC\s+\/(MC\d+)\s+BDC\s*([\s\S]*?)EMC/g
  let bdcBlockCount = 0

  for (const m of contentStream.matchAll(bdcPattern)) {
    bdcBlockCount++
    const mcName = m[1]
    const blockContent = m[2]
    const layerName = mcToLayer[mcName]
    if (!layerName) {
      console.info(
        `[pdf] BDC #${bdcBlockCount}: MC=${mcName} → no layer mapping`
      )
      continue
    }
    console.info(`[pdf] BDC #${bdcBlockCount}: MC=${mcName} → "${layerName}"`)

    const photoMatch = layerName.match(/^photo[-_]?(\d+)$/i)
    const infoMatch = layerName.match(/^info[-_]?(\d+)$/i)

    if (!photoMatch && !infoMatch) {
      console.info(`[pdf]   "${layerName}" — calque décor (conservé dans l'overlay)`)
      continue
    }

    const zoneId = photoMatch
      ? parseInt(photoMatch[1], 10)
      : parseInt(infoMatch![1], 10)
    const isBranding = Boolean(infoMatch)
    const rectPattern = /([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+([\d.-]+)\s+re/g
    let found = false

    for (const rectMatch of blockContent.matchAll(rectPattern)) {
      let x = parseFloat(rectMatch[1])
      let y = parseFloat(rectMatch[2])
      let w = parseFloat(rectMatch[3])
      let h = parseFloat(rectMatch[4])
      if (w < 0) {
        x += w
        w = -w
      }
      if (h < 0) {
        y += h
        h = -h
      }

      const afterRect = blockContent.substring(
        rectMatch.index + rectMatch[0].length,
        rectMatch.index + rectMatch[0].length + 20
      )
      if (afterRect.match(/^\s*W\s+n/)) continue

      const zoneEntry: TemplateZone = {
        id: zoneId,
        x_mm: round(x * PT_TO_MM),
        y_mm: round((pageHeight - y - h) * PT_TO_MM),
        width_mm: round(w * PT_TO_MM),
        height_mm: round(h * PT_TO_MM),
      }
      if (isBranding) brandingZone = zoneEntry
      else zones.push(zoneEntry)
      console.info(
        `[pdf] Zone ${isBranding ? "info" : "photo"}-${zoneId} (rect): ${round(w * PT_TO_MM)}x${round(h * PT_TO_MM)}mm`
      )
      found = true
    }

    if (!found) {
      const zone = extractBezierZone(blockContent, pageHeight)
      if (zone) {
        zone.id = zoneId
        if (isBranding) {
          brandingZone = zone
          console.info(
            `[pdf] Zone info-${zoneId} (bezier): ${zone.width_mm}x${zone.height_mm}mm`
          )
        } else {
          zones.push(zone)
          console.info(
            `[pdf] Zone photo-${zoneId} (bezier): ${zone.width_mm}x${zone.height_mm}mm`
          )
        }
        found = true
      }
    }

    if (!found) {
      console.warn(`[pdf]   Could not extract zone for "${layerName}"`)
    }

    const fullBlock = m[0]
    const emptyBlock = `/OC /${mcName} BDC \nEMC`
    cleanStream = cleanStream.replace(fullBlock, emptyBlock)
  }

  console.info(
    `[pdf] Total: ${bdcBlockCount} BDC block(s), ${zones.length} photo zone(s)${brandingZone ? ", 1 zone info" : ""}`
  )

  zones.sort((a, b) => a.id - b.id)
  if (cleanStream) {
    cleanStream = sanitizeBlackFillsInStream(cleanStream)
  }
  return { zones, brandingZone, cleanContentStream: cleanStream, pageHeight }
}

// ─── Create clean PDF ───

export async function createCleanPdf(
  pdfBuffer: Buffer,
  cleanContentStream: string
): Promise<Uint8Array> {
  const { PDFDocument, PDFName } = await import("pdf-lib")

  const doc = await PDFDocument.load(pdfBuffer)
  const page = doc.getPage(0)

  const compressed = zlib.deflateSync(Buffer.from(cleanContentStream))
  const stream = doc.context.stream(compressed, {
    Length: compressed.length,
    Filter: "FlateDecode",
  })
  const streamRef = doc.context.register(stream)
  page.node.set(PDFName.of("Contents"), streamRef)

  return doc.save()
}
