import { NextResponse } from "next/server"
import { getOrders } from "@/actions/order"

import auth from "@/lib/auth"
import {
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
    const [configs, orders] = await Promise.all([
      listProductPhotoConfigs(),
      getOrders(),
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
    const body = await req.json()
    const entry = upsertProductPhotoConfig({
      handle: String(body.handle ?? ""),
      name: String(body.name ?? ""),
      photosRequired: Number(body.photosRequired ?? 1),
      ratioLabel: body.ratioLabel ? String(body.ratioLabel) : undefined,
      ratioWidth: body.ratioWidth,
      ratioHeight: body.ratioHeight,
      ratioFree: Boolean(body.ratioFree),
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
