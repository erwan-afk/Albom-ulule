import fs from "node:fs"

import { NextResponse } from "next/server"

import {
  generateThumbnail,
  getTemplatePdfPath,
  getThumbnailPath,
} from "@/lib/pdf/templateManager"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // 1) Serve existing thumbnail
  const thumbPath = getThumbnailPath(params.id)
  if (thumbPath) {
    const thumb = fs.readFileSync(thumbPath)
    return new NextResponse(thumb, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    })
  }

  // 2) Generate on-the-fly if PDF exists
  const pdfPath =
    getTemplatePdfPath(params.id, "overlay") ||
    getTemplatePdfPath(params.id, "background")
  if (!pdfPath) {
    return NextResponse.json(
      { error: "Miniature introuvable" },
      { status: 404 }
    )
  }

  try {
    const ok = await generateThumbnail(params.id)
    if (!ok) {
      return NextResponse.json(
        { error: "Impossible de generer la miniature" },
        { status: 500 }
      )
    }
    const newPath = getThumbnailPath(params.id)
    if (!newPath) {
      return NextResponse.json(
        { error: "Miniature introuvable apres generation" },
        { status: 500 }
      )
    }
    const thumb = fs.readFileSync(newPath)
    return new NextResponse(thumb, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (e) {
    console.error("[thumbnail] Generation a la volee echouee:", e)
    return NextResponse.json(
      { error: "Impossible de generer la miniature" },
      { status: 500 }
    )
  }
}
