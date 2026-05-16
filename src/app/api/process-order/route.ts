import { NextRequest, NextResponse } from "next/server"

import { processOrder } from "@/lib/photo-session/processOrder"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 min for serverless platforms that honor it

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET
  if (!secret) return true // dev mode
  const provided = req.headers.get("x-internal-secret")
  return provided === secret
}

interface ProcessOrderBody {
  sessionId: string
  orderGid: string
  orderName: string
  customerName: string
  productTitle: string
  productGid?: string
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: ProcessOrderBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const {
    sessionId,
    orderGid,
    orderName,
    customerName,
    productTitle,
    productGid,
  } = body

  if (!sessionId || !orderGid || !orderName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  const result = await processOrder({
    sessionId,
    orderGid,
    orderName,
    customerName: customerName || "Client",
    productTitle: productTitle || "",
    productGid,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    pdfUrl: result.pdfUrl,
    photoCount: result.photoCount,
  })
}
