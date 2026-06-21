"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { BiLoaderAlt } from "react-icons/bi"

import type { TemplateItem } from "@/components/admin/TemplateManager"

const ProductPhotoSettings = dynamic(
  () =>
    import("@/components/admin/ProductPhotoSettings").then(
      (m) => m.ProductPhotoSettings
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <BiLoaderAlt className="animate-spin text-muted-foreground" size={24} />
      </div>
    ),
  }
)

const ProductTemplateAssociation = dynamic(
  () =>
    import("@/components/admin/ProductTemplateAssociation").then(
      (m) => m.ProductTemplateAssociation
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <BiLoaderAlt className="animate-spin text-muted-foreground" size={24} />
      </div>
    ),
  }
)

const TemplateManager = dynamic(
  () =>
    import("@/components/admin/TemplateManager").then((m) => m.TemplateManager),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <BiLoaderAlt className="animate-spin text-muted-foreground" size={24} />
      </div>
    ),
  }
)

type OrderRow = {
  id: string
  productTitle: string
}

export function DashboardTemplates() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setOrders(data.orders || [])
      setTemplates(data.templates || [])
      setError(null)
    } catch (e: any) {
      setError(e?.message || "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BiLoaderAlt className="animate-spin text-muted-foreground" size={24} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <>
      {/* Config photos par produit */}
      <ProductPhotoSettings />

      {/* Association Produit → Template */}
      <ProductTemplateAssociation
        orders={orders}
        templates={templates}
        onRefresh={fetchData}
      />

      {/* Gestion des templates */}
      <TemplateManager templates={templates} onRefresh={fetchData} />
    </>
  )
}
