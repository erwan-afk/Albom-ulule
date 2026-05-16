import fs from "node:fs"

import { NextResponse } from "next/server"

import {
  deleteTemplate,
  getTemplate,
  saveTemplate,
} from "@/lib/pdf/templateManager"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const cfg = getTemplate(params.id)
  if (!cfg) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 })
  }
  return NextResponse.json(cfg)
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    saveTemplate({ ...body, id: params.id })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 400 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  deleteTemplate(params.id)
  return NextResponse.json({ success: true })
}
