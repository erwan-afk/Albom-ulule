import fs from "node:fs"

import {
  createCleanPdf,
  extractContentStreamFromPdf,
  sanitizeBlackFillsInStream,
} from "./pdfParser"
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

/** Overlay Illustrator : remplace les aplats noirs par du blanc à la volée. */
async function loadDecorPdfBytes(filePath: string): Promise<Uint8Array> {
  const buffer = fs.readFileSync(filePath)
  const text = buffer.toString("latin1")
  const stream = extractContentStreamFromPdf(buffer, text)
  if (!stream) return buffer

  const sanitized = sanitizeBlackFillsInStream(stream)
  if (sanitized === stream) return buffer

  return createCleanPdf(buffer, sanitized)
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

    // Fond blanc (évite le noir des placeholders Illustrator / PDF par défaut)
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(1, 1, 1),
    })

    // Décor : overlay nettoyé uniquement (background.pdf garde les calques photo-*
    // souvent exportés en noir — on ne l'utilise pas à la génération)
    const decorPath = overlayPdfPath ?? bgPdfPath

    // Step 1 : décor (grille, logo) — aplats noirs convertis en blanc
    if (decorPath) {
      const decorBytes = await loadDecorPdfBytes(decorPath)
      const decorDoc = await PDFDocument.load(decorBytes)
      const [decorEmbed] = await pdfDoc.embedPdf(decorDoc, [0])
      if (decorEmbed) page.drawPage(decorEmbed)
    }

    // Step 2 : photos PAR-DESSUS le décor
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

      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color: rgb(1, 1, 1),
      })

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
  }

  // Label — zone info-1 : nom en gras + commande discrète, haut centre
  if (template.label && template.label.enabled) {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const lbl = template.label
    const nameSize = lbl.fontSize || 8
    const orderSize = lbl.secondaryFontSize ?? Math.max(5, nameSize * 0.75)
    const nameColor = lbl.color || [0.2, 0.2, 0.2]
    const orderColor = lbl.secondaryColor || [0.55, 0.55, 0.55]
    const lineGap = 2
    const padding = 4

    for (let p = 0; p < pdfDoc.getPageCount(); p++) {
      const page = pdfDoc.getPage(p)
      const pageW = page.getWidth()
      const pageH = page.getHeight()
      const bz = template.brandingZone

      if (bz) {
        const zoneX = mmToPt(bz.x_mm)
        const zoneW = mmToPt(bz.width_mm)
        const zoneTop = pageH - mmToPt(bz.y_mm)

        const nameW = fontBold.widthOfTextAtSize(customerName, nameSize)
        const nameX = zoneX + (zoneW - nameW) / 2
        const nameY = zoneTop - padding - nameSize

        page.drawText(customerName, {
          x: nameX,
          y: nameY,
          size: nameSize,
          font: fontBold,
          color: rgb(nameColor[0], nameColor[1], nameColor[2]),
        })

        const orderW = font.widthOfTextAtSize(orderNumber, orderSize)
        const orderX = zoneX + (zoneW - orderW) / 2
        const orderY = nameY - lineGap - orderSize

        page.drawText(orderNumber, {
          x: orderX,
          y: orderY,
          size: orderSize,
          font,
          color: rgb(orderColor[0], orderColor[1], orderColor[2]),
        })
        continue
      }

      // Fallback sans zone info-1
      const rawText = (lbl.text || "{customerName}\n{orderNumber}")
        .replace("{customerName}", customerName)
        .replace("{orderNumber}", orderNumber)
      const lines = rawText.split("\n").filter(Boolean)
      const fontSize = nameSize
      const lineHeight = fontSize * 1.25
      const [r, g, b] = nameColor

      lines.forEach((line, i) => {
        const tw = font.widthOfTextAtSize(line, fontSize)
        const marginRight = lbl.marginRight ?? 12
        const baseY = lbl.y || 12
        let textX = lbl.x ?? marginRight
        if (lbl.align === "right") textX = pageW - tw - marginRight
        else if (lbl.align === "center") textX = (pageW - tw) / 2

        page.drawText(line, {
          x: textX,
          y: baseY + (lines.length - 1 - i) * lineHeight,
          size: fontSize,
          font,
          color: rgb(r, g, b),
        })
      })
    }
  }

  return pdfDoc.save()
}
