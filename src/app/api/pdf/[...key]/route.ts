import { NextRequest, NextResponse } from "next/server"

import { readObject } from "@/lib/r2/upload"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params
  const objectKey = key.join("/")

  const buffer = await readObject(objectKey)
  if (!buffer) {
    return NextResponse.json({ error: "PDF introuvable" }, { status: 404 })
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${key[key.length - 1]}"`,
      // Même clé R2 à chaque régénération — pas de cache navigateur/CDN
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  })
}
