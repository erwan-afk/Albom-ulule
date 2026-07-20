"use client"

import { useState } from "react"
import { BiLoaderAlt } from "react-icons/bi"

import type { TemplateItem } from "@/components/admin/TemplateManager"
import {
  AdminMobileCard,
  AdminMobileField,
  AdminTableDesktop,
  AdminTableMobile,
} from "@/components/admin/admin-table-layout"

type OrderRow = {
  id: string
  productTitle: string
}

type Props = {
  orders: OrderRow[]
  templates: TemplateItem[]
  onRefresh: () => void
}

export function ProductTemplateAssociation({
  orders,
  templates,
  onRefresh,
}: Props) {
  const [saving, setSaving] = useState<string | null>(null)

  // Extraire les produits uniques
  const products = [
    ...new Map(orders.map((o) => [o.productTitle, o])).values(),
  ]
    .filter((o) => o.productTitle && o.productTitle !== "—")
    .sort((a, b) => a.productTitle.localeCompare(b.productTitle))

  if (products.length === 0) return null

  // Trouver le template correspondant à un produit (client-side)
  const findMatchingTemplate = (productTitle: string): TemplateItem | undefined => {
    const title = productTitle.toLowerCase()
    for (const t of templates) {
      if (t.id === "default") continue
      for (const kw of t.productKeywords) {
        if (kw && title.includes(kw.toLowerCase())) return t
      }
    }
    return templates.find((t) => t.id === "default")
  }

  const handleAssignTemplate = async (
    productTitle: string,
    newTemplateId: string
  ) => {
    setSaving(productTitle)
    try {
      const currentMatch = findMatchingTemplate(productTitle)
      const currentId = currentMatch?.id

      // Retirer le produit de l'ancien template
      if (currentId && currentId !== newTemplateId) {
        const resOld = await fetch(
          `/api/admin/pdf/templates/${currentId}`
        )
        if (resOld.ok) {
          const fullOld = await resOld.json()
          fullOld.productKeywords = (fullOld.productKeywords || []).filter(
            (kw: string) =>
              !productTitle.toLowerCase().includes(kw.toLowerCase())
          )
          await fetch(`/api/admin/pdf/templates/${currentId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fullOld),
          })
        }
      }

      // Ajouter le produit au nouveau template
      if (newTemplateId) {
        const resNew = await fetch(
          `/api/admin/pdf/templates/${newTemplateId}`
        )
        if (resNew.ok) {
          const fullNew = await resNew.json()
          const alreadyHas = (fullNew.productKeywords || []).some((kw: string) =>
            productTitle.toLowerCase().includes(kw.toLowerCase())
          )
          if (!alreadyHas) {
            fullNew.productKeywords = [
              ...(fullNew.productKeywords || []),
              productTitle,
            ]
            await fetch(`/api/admin/pdf/templates/${newTemplateId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(fullNew),
            })
          }
        }
      }

      onRefresh()
    } catch (e: any) {
      alert(e?.message || "Erreur lors de l'association")
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="min-w-0 rounded-xl border bg-card p-4 sm:p-6">
      <h2 className="mb-1 text-lg font-bold text-foreground">
        🔗 Association Produit → Template
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Associez chaque produit à un template PDF. Le template sélectionné sera
        utilisé automatiquement pour toutes les commandes de ce produit.
      </p>

      <AdminTableDesktop>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Produit
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Commandes
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Template actuel
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nouveau template
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((o) => {
              const current = findMatchingTemplate(o.productTitle)
              const orderCount = orders.filter(
                (ord) => ord.productTitle === o.productTitle
              ).length
              return (
                <tr
                  key={o.productTitle}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium">{o.productTitle}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {orderCount} commande{orderCount > 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3">
                    {current ? (
                      <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {current.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Aucun
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={current?.id || ""}
                        disabled={saving === o.productTitle}
                        onChange={(e) =>
                          handleAssignTemplate(o.productTitle, e.target.value)
                        }
                        className="w-full max-w-xs cursor-pointer rounded-md border px-2.5 py-1.5 text-sm text-foreground"
                      >
                        <option value="">— Aucun (auto) —</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.zonesCount} zones)
                          </option>
                        ))}
                      </select>
                      {saving === o.productTitle && (
                        <BiLoaderAlt
                          className="animate-spin text-muted-foreground"
                          size={14}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </AdminTableDesktop>

      <AdminTableMobile>
        {products.map((o) => {
          const current = findMatchingTemplate(o.productTitle)
          const orderCount = orders.filter(
            (ord) => ord.productTitle === o.productTitle
          ).length
          return (
            <AdminMobileCard key={o.productTitle}>
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium">{o.productTitle}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {orderCount} commande{orderCount > 1 ? "s" : ""}
                </span>
              </div>

              <AdminMobileField label="Template actuel">
                {current ? (
                  <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {current.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Aucun</span>
                )}
              </AdminMobileField>

              <AdminMobileField label="Nouveau template">
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={current?.id || ""}
                    disabled={saving === o.productTitle}
                    onChange={(e) =>
                      handleAssignTemplate(o.productTitle, e.target.value)
                    }
                    className="w-full cursor-pointer rounded-md border px-2.5 py-1.5 text-sm text-foreground"
                  >
                    <option value="">— Aucun (auto) —</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.zonesCount} zones)
                      </option>
                    ))}
                  </select>
                  {saving === o.productTitle && (
                    <BiLoaderAlt
                      className="shrink-0 animate-spin text-muted-foreground"
                      size={14}
                    />
                  )}
                </div>
              </AdminMobileField>
            </AdminMobileCard>
          )
        })}
      </AdminTableMobile>
    </div>
  )
}
