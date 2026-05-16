import { NextResponse } from "next/server"

import { createCleanPdf, parsePdfTemplate } from "@/lib/pdf/pdfParser"
import {
  generateThumbnail,
  getTemplate,
  getTemplatePdfPath,
  saveTemplate,
  saveTemplatePdf,
} from "@/lib/pdf/templateManager"

// GET — servir le PDF du template
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const pdfPath =
    getTemplatePdfPath(params.id, "overlay") ||
    getTemplatePdfPath(params.id, "background")
  if (!pdfPath) {
    return NextResponse.json({ error: "PDF introuvable" }, { status: 404 })
  }
  const fs = await import("node:fs")
  const pdf = fs.readFileSync(pdfPath)
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "public, max-age=3600",
    },
  })
}

// POST — uploader un PDF + détecter les zones + créer overlay clean
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await req.formData()
    const file = formData.get("pdf") as File | null
    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier PDF fourni" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Step 1: Parse PDF to extract photo zones + clean content stream
    const parseResult = parsePdfTemplate(buffer)
    console.info(
      `[pdf] Uploaded template "${params.id}": ${parseResult.zones.length} zone(s) detected, cleanStream=${parseResult.cleanContentStream ? "yes" : "no"}`
    )

    // Step 2: Save original as background.pdf
    saveTemplatePdf(params.id, "background", buffer)

    // Step 3: Generate clean overlay.pdf (photo layers removed)
    if (parseResult.cleanContentStream) {
      try {
        const cleanPdf = await createCleanPdf(
          buffer,
          parseResult.cleanContentStream
        )
        saveTemplatePdf(params.id, "overlay", Buffer.from(cleanPdf))
        console.info(`[pdf] Clean overlay created for "${params.id}"`)
      } catch (err) {
        console.error(
          `[pdf] Failed to create clean overlay: ${(err as Error).message}`
        )
        // If clean PDF creation fails, use the original as overlay too
        saveTemplatePdf(params.id, "overlay", buffer)
      }
    } else {
      // No photo layers found — use original as overlay (no cleanup needed)
      console.info(`[pdf] No photo layers found, using original as overlay`)
      saveTemplatePdf(params.id, "overlay", buffer)
    }

    // Step 4: Update config.json with detected zones
    const existingConfig = getTemplate(params.id)
    saveTemplate({
      id: params.id,
      name: existingConfig?.name,
      productIds: existingConfig?.productIds || [],
      productKeywords: existingConfig?.productKeywords || [],
      resolutionDpi: existingConfig?.resolutionDpi || 150,
      label: existingConfig?.label || {
        enabled: true,
        fontSize: 8,
        text: "{customerName} — {orderNumber}",
        y: 15,
        color: [0.3, 0.3, 0.3],
        align: "center",
      },
      zones: parseResult.zones,
    })

    // Step 5: Generate thumbnail from overlay (background)
    generateThumbnail(params.id).catch((err) => {
      console.error("[thumbnail] Generation error:", (err as Error).message)
    })

    return NextResponse.json({
      success: true,
      detectedZones: parseResult.zones,
      hasCleanOverlay: !!parseResult.cleanContentStream,
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur upload" },
      { status: 500 }
    )
  }
}
