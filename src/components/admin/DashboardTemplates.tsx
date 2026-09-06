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

export function DashboardTemplates() {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { templates?: TemplateItem[] }
      setTemplates(data.templates || [])
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return (
    <>
      <section id="produits" className="scroll-mt-8">
        <ProductPhotoSettings />
      </section>

      <section id="templates-pdf" className="scroll-mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <BiLoaderAlt
              className="animate-spin text-muted-foreground"
              size={24}
            />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <TemplateManager templates={templates} onRefresh={() => void fetchData()} />
        )}
      </section>
    </>
  )
}
