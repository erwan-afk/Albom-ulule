import { NextResponse } from "next/server"
import { getOrders } from "@/actions/order"

import auth from "@/lib/auth"
import { listTemplates } from "@/lib/pdf/templateManager"
import {
  createProductPhotoConfig,
  deleteProductPhotoConfig,
  listProductPhotoConfigs,
  normalizeHandle,
  upsertProductPhotoConfig,
} from "@/lib/products/photoConfigStore"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    return null
  }
  return session
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const [configs, orders, templates] = await Promise.all([
      listProductPhotoConfigs(),
      getOrders(),
      Promise.resolve(listTemplates()),
    ])

    const catalogMap = new Map<
      string,
      { handle: string; name: string; orderCount: number }
    >()

    for (const order of orders) {
      const name = order.productName?.trim()
      if (!name) continue
      const handle = normalizeHandle(order.productHandle || name)
      const existing = catalogMap.get(handle)
      if (existing) {
        existing.orderCount += 1
      } else {
        catalogMap.set(handle, { handle, name, orderCount: 1 })
      }
    }

    return NextResponse.json({
      configs,
      catalog: [...catalogMap.values()].sort((a, b) =>
        a.name.localeCompare(b.name, "fr")
      ),
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        zonesCount: t.zonesCount,
        productKeywords: t.productKeywords,
      })),
    })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = (await req.json()) as {
      create?: boolean
      handle?: string
      name?: string
      photosRequired?: number
      ratioLabel?: string
      ratioWidth?: string | number
      ratioHeight?: string | number
      ratioFree?: boolean
      templateId?: string | null
    }

    if (body.create) {
      const entry = createProductPhotoConfig(String(body.name ?? ""))
      return NextResponse.json({ success: true, config: entry })
    }

    const entry = upsertProductPhotoConfig({
      handle: String(body.handle ?? ""),
      name: String(body.name ?? ""),
      photosRequired: Number(body.photosRequired ?? 1),
      ratioLabel: body.ratioLabel ? String(body.ratioLabel) : undefined,
      ratioWidth: body.ratioWidth,
      ratioHeight: body.ratioHeight,
      ratioFree: Boolean(body.ratioFree),
      templateId:
        body.templateId === undefined ? undefined : String(body.templateId ?? ""),
    })
    return NextResponse.json({ success: true, config: entry })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 400 }
    )
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const handle = searchParams.get("handle")
    if (!handle) {
      return NextResponse.json({ error: "Handle manquant" }, { status: 400 })
    }
    const deleted = deleteProductPhotoConfig(handle)
    if (!deleted) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 400 }
    )
  }
}
