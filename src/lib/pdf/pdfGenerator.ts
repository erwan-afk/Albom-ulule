import fs from "node:fs"

import { getTemplatePdfPath } from "./templateManager"
import type { GeneratePdfInput, ProcessedImage, TemplateConfig } from "./types"

// ─── Unit conversions ───

const MM_TO_PT = 72 / 25.4

function mmToPt(mm: number): number {
  return mm * MM_TO_PT
}

export function ptToPx(pt: number, dpi: number): number {
  return Math.round((pt / 72) * dpi)
}

export function getCellDimensions(template: TemplateConfig): {
  cellWidth: number
  cellHeight: number
} {
  const zone = template.zones[0]
  if (!zone) {
    return { cellWidth: mmToPt(150), cellHeight: mmToPt(100) }
  }
  return {
    cellWidth: mmToPt(zone.width_mm),
    cellHeight: mmToPt(zone.height_mm),
  }
}

// ─── PDF Generation ───

export async function generatePdf(
  input: GeneratePdfInput
): Promise<Uint8Array> {
  const { images, customerName, orderNumber, template } = input

  const validImages = images.filter(
    (img): img is ProcessedImage => img !== null
  )
  if (validImages.length === 0)
    throw new Error("No valid images to generate PDF")

  const {
    PDFDocument,
    rgb,
    StandardFonts,
    pushGraphicsState,
    popGraphicsState,
    moveTo,
    lineTo,
    appendBezierCurve,
    clip,
    endPath,
  } = await import("pdf-lib")

  const overlayPdfPath = getTemplatePdfPath(template.id, "overlay")
  const bgPdfPath = getTemplatePdfPath(template.id, "background")

  const pdfDoc = await PDFDocument.create()
  const zonesPerPage = template.zones.length
  const totalPages = Math.ceil(validImages.length / zonesPerPage)

  let pageWidth = 595.28
  let pageHeight = 841.89

  if (overlayPdfPath) {
    const overlayDoc = await PDFDocument.load(fs.readFileSync(overlayPdfPath))
    const firstPage = overlayDoc.getPage(0)
    pageWidth = firstPage.getWidth()
    pageHeight = firstPage.getHeight()
  } else if (bgPdfPath) {
    const bgDoc = await PDFDocument.load(fs.readFileSync(bgPdfPath))
    const firstPage = bgDoc.getPage(0)
    pageWidth = firstPage.getWidth()
    pageHeight = firstPage.getHeight()
  }

  for (let p = 0; p < totalPages; p++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight])

    // Step 1: Draw background PDF
    if (bgPdfPath) {
      const bgDoc = await PDFDocument.load(fs.readFileSync(bgPdfPath))
      const [bgEmbed] = await pdfDoc.embedPdf(bgDoc, [0])
      if (bgEmbed) page.drawPage(bgEmbed)
    }

    // Step 2: Draw photos with clipping masks
    const startIdx = p * zonesPerPage
    for (
      let i = 0;
      i < zonesPerPage && startIdx + i < validImages.length;
      i++
    ) {
      const img = validImages[startIdx + i]
      if (!img) continue
      const zone = template.zones[i]
      if (!zone) continue

      const x = mmToPt(zone.x_mm)
      const w = mmToPt(zone.width_mm)
      const h = mmToPt(zone.height_mm)
      const y = pageHeight - mmToPt(zone.y_mm) - h

      const embedded =
        img.format === "png"
          ? await pdfDoc.embedPng(img.buffer)
          : await pdfDoc.embedJpg(img.buffer)

      if (zone.clipPath && zone.clipPath.commands.length > 0) {
        const { tx, ty } = zone.clipPath.transform
        const ops = [pushGraphicsState()]

        for (const cmd of zone.clipPath.commands) {
          const a = cmd.args
          switch (cmd.op) {
            case "m":
              ops.push(moveTo(tx + a[0]!, ty + a[1]!))
              break
            case "l":
              ops.push(lineTo(tx + a[0]!, ty + a[1]!))
              break
            case "c":
              ops.push(
                appendBezierCurve(
                  tx + a[0]!,
                  ty + a[1]!,
                  tx + a[2]!,
                  ty + a[3]!,
                  tx + a[4]!,
                  ty + a[5]!
                )
              )
              break
          }
        }

        ops.push(clip(), endPath())
        page.pushOperators(...ops)
        page.drawImage(embedded, { x, y, width: w, height: h })
        page.pushOperators(popGraphicsState())
      } else {
        page.drawImage(embedded, { x, y, width: w, height: h })
      }
    }

    // Step 3: Overlay clean template
    if (overlayPdfPath) {
      const overlayDoc = await PDFDocument.load(fs.readFileSync(overlayPdfPath))
      const [overlayEmbed] = await pdfDoc.embedPdf(overlayDoc, [0])
      if (overlayEmbed) page.drawPage(overlayEmbed)
    }
  }

  // Label
  if (template.label && template.label.enabled) {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const lbl = template.label
    const text = (lbl.text || "{customerName} — {orderNumber}")
      .replace("{customerName}", customerName)
      .replace("{orderNumber}", orderNumber)
    const [r, g, b] = lbl.color || [0.3, 0.3, 0.3]

    for (let p = 0; p < pdfDoc.getPageCount(); p++) {
      const page = pdfDoc.getPage(p)
      const tw = font.widthOfTextAtSize(text, lbl.fontSize || 8)
      let textX = lbl.x ?? pageWidth / 2
      if (lbl.align === "center") textX = (pageWidth - tw) / 2
      page.drawText(text, {
        x: textX,
        y: lbl.y || 15,
        size: lbl.fontSize || 8,
        font,
        color: rgb(r, g, b),
      })
    }
  }

  return pdfDoc.save()
}
