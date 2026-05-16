import { NextResponse } from "next/server"
import { getOrders } from "@/actions/order"

import { listTemplates } from "@/lib/pdf/templateManager"
import { getAllLiveOrders } from "@/lib/photo-session/ordersLog"

export async function GET() {
  try {
    const [orders, templates] = await Promise.all([
      getOrders(),
      listTemplates(),
    ])

    const enriched = orders.map((o) => {
      // Check if there's a live processing entry for this order
      const liveEntry = getAllLiveOrders().find(
        (live) =>
          live.orderName === o.productHandle ||
          live.sessionId === `db-${o.token}`
      )

      if (liveEntry) {
        return {
          id: o.id,
          customerName: liveEntry.customerName || o.customerName || "—",
          orderName: liveEntry.orderName || o.productHandle || o.id,
          productTitle: liveEntry.productTitle || o.productName || "—",
          status: liveEntry.status,
          progress: liveEntry.progress,
          progressStep: liveEntry.progressStep,
          pdfUrl: liveEntry.pdfUrl || null,
          photoCount: liveEntry.photoUrls?.length ?? o.files?.length ?? 0,
          errorMessage: liveEntry.errorMessage,
          createdAt: new Date(o.createdAt).getTime(),
          updatedAt: new Date(o.updatedAt).getTime(),
        }
      }

      return {
        id: o.id,
        customerName: o.customerName || "—",
        orderName: o.productHandle || o.id,
        productTitle: o.productName || "—",
        status:
          o.status === "PRINTED"
            ? "completed"
            : o.status === "PHOTOS_UPLOADED"
              ? "completed"
              : o.status === "PENDING"
                ? "pending"
                : "processing",
        progress:
          o.status === "PRINTED"
            ? 100
            : o.status === "PHOTOS_UPLOADED"
              ? 100
              : o.status === "LINK_SENT"
                ? 20
                : 0,
        progressStep:
          o.status === "PRINTED"
            ? "PDF genere"
            : o.status === "PHOTOS_UPLOADED"
              ? "Photos recues"
              : o.status === "LINK_SENT"
                ? "Lien envoye"
                : "En attente",
        pdfUrl: null,
        photoCount: o.files?.length ?? 0,
        createdAt: new Date(o.createdAt).getTime(),
        updatedAt: new Date(o.updatedAt).getTime(),
      }
    })

    // Also include live orders that might not be in DB yet
    for (const live of getAllLiveOrders()) {
      const alreadyInList = enriched.some(
        (o) =>
          o.orderName === live.orderName ||
          o.id === live.sessionId.replace("db-", "")
      )
      if (!alreadyInList) {
        enriched.push({
          id: live.sessionId,
          customerName: live.customerName || "—",
          orderName: live.orderName,
          productTitle: live.productTitle || "—",
          status: live.status,
          progress: live.progress,
          progressStep: live.progressStep,
          pdfUrl: live.pdfUrl || null,
          photoCount: live.photoUrls?.length ?? 0,
          errorMessage: live.errorMessage,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      }
    }

    return NextResponse.json({ orders: enriched, templates })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur serveur" },
      { status: 500 }
    )
  }
}
