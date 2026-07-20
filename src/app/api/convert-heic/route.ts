import { NextResponse } from "next/server"

import { PRINT_JPEG_QUALITY } from "@/lib/images/constants"

const MAX_BYTES = 10 * 1024 * 1024

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant." }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (10 Mo max)." },
        { status: 400 }
      )
    }

    const input = Buffer.from(await file.arrayBuffer())
    const sharp = (await import("sharp")).default

    const jpeg = await sharp(input, { failOn: "none" })
      .rotate()
      .jpeg({ quality: PRINT_JPEG_QUALITY, mozjpeg: true, chromaSubsampling: "4:4:4" })
      .toBuffer()

    if (jpeg.length === 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de décoder ce HEIC sur le serveur (libheif manquant ?).",
        },
        { status: 422 }
      )
    }

    return new NextResponse(jpeg, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur de conversion HEIC"
    console.error("[convert-heic]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
