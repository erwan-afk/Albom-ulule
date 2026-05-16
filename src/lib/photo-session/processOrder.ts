/**
 * Orchestrates the PDF generation after photos are confirmed.
 *
 * Called from:
 * - POST /api/process-order (external/internal API)
 * - confirmUpload action (automatic trigger)
 *
 * All heavy dependencies (sharp, pdf-lib, @aws-sdk) are dynamically imported.
 */

import { generatePdf, getCellDimensions, ptToPx } from "@/lib/pdf/pdfGenerator"
import { findTemplateForProduct, getTemplate } from "@/lib/pdf/templateManager"
import type { ProcessedImage } from "@/lib/pdf/types"
import { getOrder, upsertOrder } from "@/lib/photo-session/ordersLog"
import {
  createPendingSession,
  deletePendingSession,
  getPendingSession,
  type PendingSession,
} from "@/lib/photo-session/pendingSessions"
import { isR2Configured } from "@/lib/r2/client"
import {
  deleteByKey,
  emergencyCleanup,
  moveTempImagesToOrder,
  readObject,
  uploadPdf,
} from "@/lib/r2/upload"
import { setOrderPdfUrl } from "@/lib/shopify/admin/orderMetafield"

export interface ProcessOrderParams {
  sessionId: string
  orderGid: string
  orderName: string
  customerName: string
  productTitle: string
  productGid?: string
}

export interface ProcessOrderResult {
  ok: boolean
  pdfUrl?: string
  photoCount?: number
  error?: string
}

async function processWithSharp(
  buffers: Buffer[],
  cellWidthPx: number,
  cellHeightPx: number
): Promise<(ProcessedImage | null)[]> {
  let sharp: any = null
  try {
    sharp = (await import("sharp")).default
  } catch {
    console.warn("[process-order] sharp not available, images kept as-is")
  }

  return Promise.all(
    buffers.map(async (raw, idx) => {
      try {
        if (!raw) return null
        if (sharp) {
          const buffer = await sharp(raw)
            .resize(cellWidthPx, cellHeightPx, {
              fit: "cover",
              position: "centre",
            })
            .jpeg({ quality: 90 })
            .toBuffer()
          return { buffer, format: "jpeg" as const }
        }
        return { buffer: raw, format: "jpeg" as const }
      } catch (err) {
        console.error(
          `[process-order] sharp failed on image ${idx}: ${(err as Error).message}`
        )
        return null
      }
    })
  )
}

/**
 * Main entry point. Call this after photos are uploaded and ready.
 * Handles R2 or local filesystem transparently.
 */
export async function processOrder(
  params: ProcessOrderParams
): Promise<ProcessOrderResult> {
  const {
    sessionId,
    orderGid,
    orderName,
    customerName,
    productTitle,
    productGid,
  } = params

  const baseEntry = {
    sessionId,
    orderGid,
    orderName,
    productTitle: productTitle || "",
    customerName: customerName || "Client",
  }

  const setStatus = (
    progress: number,
    progressStep: string,
    extra: Partial<{
      status: "processing" | "completed" | "failed"
      pdfUrl: string
      photoUrls: string[]
      errorMessage: string
    }> = {}
  ) => {
    upsertOrder({
      ...baseEntry,
      progress,
      progressStep,
      status: extra.status || "processing",
      pdfUrl: extra.pdfUrl,
      photoUrls: extra.photoUrls,
      errorMessage: extra.errorMessage,
    })
  }

  try {
    // ── Step 1: lookup pending session ──
    setStatus(5, "Commande reçue")
    const pending = getPendingSession(sessionId)
    if (!pending || pending.tempKeys.length === 0) {
      throw new Error(`No pending session found for sessionId=${sessionId}`)
    }

    // ── Step 2: move temp → confirmed ──
    // Si les fichiers sont deja dans orders/, on saute le deplacement
    const alreadyMoved =
      pending.tempKeys.length > 0 && pending.tempKeys[0]!.startsWith("orders/")
    let finalKeys: string[]
    let finalUrls: string[]

    if (alreadyMoved) {
      setStatus(20, "Photos deja sauvegardees")
      finalKeys = pending.tempKeys
      finalUrls = finalKeys.map((k) => `/api/photo/${k}`)
    } else {
      setStatus(20, "Sauvegarde des photos")
      const moved = await moveTempImagesToOrder(pending.tempKeys, orderName)
      finalKeys = moved.finalKeys
      finalUrls = moved.finalUrls
    }
    setStatus(20, "Sauvegarde des photos", { photoUrls: finalUrls })

    // ── Step 3: load template ──
    const order = getOrder(sessionId)
    let template = order?.templateId ? getTemplate(order.templateId) : null
    if (!template) {
      template = findTemplateForProduct(productTitle, productGid)
    }
    if (!template) {
      throw new Error(
        `No PDF template matched product "${productTitle}" — please configure templates in /admin/pdf`
      )
    }

    // ── Step 4: download buffers ──
    setStatus(35, "Téléchargement")
    const buffers: Buffer[] = []
    for (const key of finalKeys) {
      const buf = await readObject(key)
      if (buf) buffers.push(buf)
    }
    if (buffers.length === 0) {
      throw new Error("Could not read any confirmed photo from storage")
    }

    // ── Step 5: sharp resize ──
    setStatus(55, "Optimisation")
    const { cellWidth, cellHeight } = getCellDimensions(template)
    const dpi = template.resolutionDpi || 150
    const cellWidthPx = ptToPx(cellWidth, dpi)
    const cellHeightPx = ptToPx(cellHeight, dpi)
    const images = await processWithSharp(buffers, cellWidthPx, cellHeightPx)

    // ── Step 6: pdf-lib generation ──
    setStatus(80, "Création du PDF")
    const pdfBytes = await generatePdf({
      images,
      customerName: customerName || "Client",
      orderNumber: orderName,
      template,
    })

    // ── Step 7: upload PDF + metafield ──
    setStatus(90, "Sauvegarde du PDF")
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || undefined
    const pdfUpload = await uploadPdf(Buffer.from(pdfBytes), orderName, siteUrl)

    try {
      await setOrderPdfUrl(orderGid, pdfUpload.url)
    } catch (err) {
      console.warn(
        `[process-order] Failed to write metafield (PDF still saved): ${(err as Error).message}`
      )
    }

    // ── Step 8: cleanup confirmed source photos ──
    setStatus(100, "Finalisation", {
      status: "completed",
      pdfUrl: pdfUpload.url,
      photoUrls: finalUrls,
    })

    // Ne pas supprimer les fichiers source si on est en regeneration (alreadyMoved)
    if (isR2Configured() && !alreadyMoved) {
      for (const key of finalKeys) {
        try {
          await deleteByKey(key)
        } catch {
          // best-effort
        }
      }
    }

    deletePendingSession(sessionId)

    console.info(
      `[process-order] OK ${orderName} — ${(pdfBytes.length / 1024).toFixed(0)} KB`
    )

    return {
      ok: true,
      pdfUrl: pdfUpload.url,
      photoCount: finalUrls.length,
    }
  } catch (err) {
    const message = (err as Error).message || "Unknown error"
    console.error(`[process-order] FAILED ${orderName}: ${message}`)
    setStatus(0, "Échec", {
      status: "failed",
      errorMessage: message,
    })

    try {
      await emergencyCleanup(sessionId)
    } catch {
      // ignore
    }

    return { ok: false, error: message }
  }
}

/**
 * Bridge from the existing DB-based upload flow:
 * creates a pending session from local file paths and triggers processing.
 */
export async function processOrderFromDb(
  token: string,
  orderName: string,
  customerName: string,
  productTitle: string,
  filePaths: string[],
  orderGid?: string,
  productGid?: string
): Promise<ProcessOrderResult> {
  const sessionId = `db-${token}`

  // Create a pending session using the existing local file paths as temp keys
  const session: PendingSession = {
    sessionId,
    orderGid: orderGid || `gid://shopify/Order/0`,
    orderName,
    customerName: customerName || "Client",
    productTitle: productTitle || "",
    productGid,
    tempKeys: filePaths,
    createdAt: Date.now(),
  }

  createPendingSession(session)

  return processOrder({
    sessionId,
    orderGid: session.orderGid,
    orderName,
    customerName,
    productTitle,
    productGid,
  })
}
