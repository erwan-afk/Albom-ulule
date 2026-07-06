/**
 * Orders log — tracks PDF generation progress for display in admin dashboard.
 *
 * Uses the existing Prisma Order model for persistence,
 * with an in-memory cache for real-time progress updates during processing.
 */

import { prisma } from "@/config/db"

export interface OrderLogEntry {
  sessionId: string
  orderGid: string
  orderName: string
  productTitle: string
  customerName: string
  progress: number // 0-100
  progressStep: string
  status: "processing" | "completed" | "failed"
  pdfUrl?: string
  photoUrls?: string[]
  errorMessage?: string
  templateId?: string
}

// In-memory store for real-time progress (processing takes ~30-60s)
const liveOrders = new Map<string, OrderLogEntry>()

function liveKey(sessionId: string): string {
  return `live:${sessionId}`
}

export function upsertOrder(entry: OrderLogEntry): void {
  liveOrders.set(liveKey(entry.sessionId), entry)

  // Persist completion/failure to DB
  if (entry.status === "completed" || entry.status === "failed") {
    persistToDb(entry).catch((err) => {
      console.error(
        `[ordersLog] Failed to persist ${entry.sessionId}: ${(err as Error).message}`
      )
    })
  }
}

async function persistToDb(entry: OrderLogEntry): Promise<void> {
  const newStatus =
    entry.status === "completed"
      ? ("PRINTED" as const)
      : ("PHOTOS_UPLOADED" as const)

  const notes = entry.errorMessage
    ? `PDF failed: ${entry.errorMessage}`
    : `PDF: ${entry.pdfUrl || "generated"}`

  // Flux dashboard : sessionId = db-<token> — une commande par token
  if (entry.sessionId.startsWith("db-")) {
    const token = entry.sessionId.slice(3)
    try {
      await prisma.order.update({
        where: { token },
        data: { status: newStatus, notes },
      })
    } catch (err) {
      console.warn(
        `[ordersLog] DB update by token failed: ${(err as Error).message}`
      )
    }
    return
  }

  // Autres flux (ex. Shopify) : orderName = numéro de commande unique
  try {
    await prisma.order.updateMany({
      where: {
        productHandle: entry.orderName,
        status: { in: ["PHOTOS_UPLOADED", "PRINTED"] },
      },
      data: { status: newStatus, notes },
    })
  } catch (err) {
    console.warn(
      `[ordersLog] DB update by handle failed: ${(err as Error).message}`
    )
  }

  // Clean up live entry after 5 minutes
  setTimeout(
    () => {
      liveOrders.delete(liveKey(entry.sessionId))
    },
    5 * 60 * 1000
  )
}

export function getOrder(sessionId: string): OrderLogEntry | undefined {
  return liveOrders.get(liveKey(sessionId))
}

export function getAllLiveOrders(): OrderLogEntry[] {
  return Array.from(liveOrders.values())
}

export function removeLiveOrder(sessionId: string): void {
  liveOrders.delete(liveKey(sessionId))
}
