"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { BiLoaderAlt } from "react-icons/bi"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AdminMobileCard,
  AdminMobileField,
  AdminTableDesktop,
  AdminTableMobile,
} from "@/components/admin/admin-table-layout"
import type { StoredProductPhotoConfig } from "@/lib/products/photoConfigStore"
import { fieldsFromRatioLabel } from "@/lib/upload/ratio"

type CatalogItem = {
  handle: string
  name: string
  orderCount: number
}

type TemplateOption = {
  id: string
  name: string
  zonesCount: number
  productKeywords: string[]
}

type RowState = {
  handle: string
  name: string
  photosRequired: number
  ratioWidth: string
  ratioHeight: string
  ratioFree: boolean
  templateId: string
  configured: boolean
  orderCount: number
}

const selectClassName =
  "w-full max-w-xs cursor-pointer rounded-md border px-2.5 py-1.5 text-sm text-foreground"

function matchTemplateByKeywords(
  productName: string,
  templates: TemplateOption[]
): string {
  const title = productName.toLowerCase()
  for (const t of templates) {
    if (t.id === "default") continue
    for (const kw of t.productKeywords) {
      if (kw && title.includes(kw.toLowerCase())) return t.id
    }
  }
  return ""
}

function RatioMmInput({
  width,
  height,
  free,
  onChange,
}: {
  width: string
  height: string
  free: boolean
  onChange: (patch: {
    ratioWidth?: string
    ratioHeight?: string
    ratioFree?: boolean
  }) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="number"
          min={1}
          step="0.1"
          value={width}
          disabled={free}
          onChange={(e) => onChange({ ratioWidth: e.target.value })}
          placeholder="74"
          className="w-16"
          aria-label="Largeur en mm"
        />
        <span className="text-xs text-muted-foreground">×</span>
        <Input
          type="number"
          min={1}
          step="0.1"
          value={height}
          disabled={free}
          onChange={(e) => onChange({ ratioHeight: e.target.value })}
          placeholder="105"
          className="w-16"
          aria-label="Hauteur en mm"
        />
        <span className="text-xs text-muted-foreground">mm</span>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <Checkbox
          checked={free}
          onCheckedChange={(checked) =>
            onChange({ ratioFree: checked === true })
          }
        />
        Pas de format imposé
      </label>
    </div>
  )
}

function buildRows(
  configs: StoredProductPhotoConfig[],
  catalog: CatalogItem[],
  templates: TemplateOption[]
): RowState[] {
  const map = new Map<string, RowState>()

  for (const cfg of configs) {
    const ratio = fieldsFromRatioLabel(cfg.ratioLabel)
    map.set(cfg.handle, {
      handle: cfg.handle,
      name: cfg.name,
      photosRequired: cfg.photosRequired,
      ratioWidth: ratio.width,
      ratioHeight: ratio.height,
      ratioFree: ratio.free,
      templateId: cfg.templateId || matchTemplateByKeywords(cfg.name, templates),
      configured: true,
      orderCount: 0,
    })
  }

  for (const item of catalog) {
    const existing =
      map.get(item.handle) ||
      [...map.values()].find(
        (row) => row.name.trim().toLowerCase() === item.name.trim().toLowerCase()
      )

    if (existing) {
      existing.orderCount += item.orderCount
      continue
    }

    map.set(item.handle, {
      handle: item.handle,
      name: item.name,
      photosRequired: 1,
      ratioWidth: "",
      ratioHeight: "",
      ratioFree: true,
      templateId: matchTemplateByKeywords(item.name, templates),
      configured: false,
      orderCount: item.orderCount,
    })
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"))
}

function rowPayload(row: RowState) {
  return {
    handle: row.handle,
    name: row.name,
    photosRequired: row.photosRequired,
    ratioWidth: row.ratioWidth,
    ratioHeight: row.ratioHeight,
    ratioFree: row.ratioFree,
    templateId: row.templateId,
  }
}

export function ProductPhotoSettings() {
  const [rows, setRows] = useState<RowState[]>([])
  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as {
        configs?: StoredProductPhotoConfig[]
        catalog?: CatalogItem[]
        templates?: TemplateOption[]
      }
      const nextTemplates = data.templates ?? []
      setTemplates(nextTemplates)
      setRows(buildRows(data.configs ?? [], data.catalog ?? [], nextTemplates))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const missingTemplateCount = useMemo(
    () => rows.filter((r) => !r.templateId).length,
    [rows]
  )

  const updateRow = (handle: string, patch: Partial<RowState>) => {
    setRows((prev) =>
      prev.map((row) => (row.handle === handle ? { ...row, ...patch } : row))
    )
  }

  const saveRow = async (row: RowState) => {
    if (!row.name.trim()) {
      alert("Le nom du produit est requis.")
      return
    }
    setSaving(row.handle)
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowPayload(row)),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur de sauvegarde")
      await fetchData()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(null)
    }
  }

  const addProduct = async () => {
    const name = newName.trim()
    if (!name) return
    setAdding(true)
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ create: true, name }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error || "Erreur de création")
      setNewName("")
      await fetchData()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur")
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BiLoaderAlt className="animate-spin text-muted-foreground" size={24} />
      </div>
    )
  }

  return (
    <div className="min-w-0 rounded-xl border bg-card p-4 shadow-none sm:p-6">
      <h2 className="mb-1 text-2xl font-semibold leading-tight tracking-tight text-foreground">
        Produits
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Ajoute tes produits ici, puis règle le nombre de photos, le recadrage
        (en mm) et le template PDF. Enregistre chaque ligne. Tu pourras ensuite
        les choisir dans une nouvelle commande.
        {missingTemplateCount > 0 && (
          <span className="mt-1 block text-amber-600 dark:text-amber-400">
            {missingTemplateCount} produit
            {missingTemplateCount > 1 ? "s" : ""} sans template PDF — le dépôt
            marchera, mais la génération du PDF risque d&apos;échouer.
          </span>
        )}
      </p>

      <form
        className="mb-5 flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void addProduct()
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="new-product-name">Nouveau produit</Label>
          <Input
            id="new-product-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ex. Bord de mer"
            className="w-64"
          />
        </div>
        <Button type="submit" disabled={adding || !newName.trim()}>
          {adding ? "Ajout..." : "Ajouter un produit"}
        </Button>
      </form>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun produit pour l&apos;instant. Clique sur « Ajouter un produit »
          pour en créer un.
        </p>
      ) : (
        <>
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
                    Nb photos
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Taille photo (mm)
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Template
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.handle}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <Input
                        value={row.name}
                        onChange={(e) =>
                          updateRow(row.handle, { name: e.target.value })
                        }
                        aria-label="Nom du produit"
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.orderCount}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={row.photosRequired}
                        onChange={(e) =>
                          updateRow(row.handle, {
                            photosRequired: Number(e.target.value) || 1,
                          })
                        }
                        className="w-20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <RatioMmInput
                        width={row.ratioWidth}
                        height={row.ratioHeight}
                        free={row.ratioFree}
                        onChange={(patch) => updateRow(row.handle, patch)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.templateId}
                        onChange={(e) =>
                          updateRow(row.handle, { templateId: e.target.value })
                        }
                        className={selectClassName}
                        aria-label="Template PDF"
                      >
                        <option value="">— Aucun (défaut) —</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.zonesCount} zones)
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={saving === row.handle}
                        onClick={() => {
                          void saveRow(row)
                        }}
                      >
                        {saving === row.handle ? (
                          <BiLoaderAlt className="animate-spin" size={14} />
                        ) : (
                          "Enregistrer"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableDesktop>

          <AdminTableMobile>
            {rows.map((row) => (
              <AdminMobileCard key={row.handle}>
                <AdminMobileField label="Produit">
                  <Input
                    value={row.name}
                    onChange={(e) =>
                      updateRow(row.handle, { name: e.target.value })
                    }
                  />
                </AdminMobileField>

                <p className="text-xs text-muted-foreground">
                  {row.orderCount} commande{row.orderCount > 1 ? "s" : ""}
                </p>

                <AdminMobileField label="Nb photos">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={row.photosRequired}
                    onChange={(e) =>
                      updateRow(row.handle, {
                        photosRequired: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full max-w-[8rem]"
                  />
                </AdminMobileField>

                <AdminMobileField label="Taille photo (mm)">
                  <RatioMmInput
                    width={row.ratioWidth}
                    height={row.ratioHeight}
                    free={row.ratioFree}
                    onChange={(patch) => updateRow(row.handle, patch)}
                  />
                </AdminMobileField>

                <AdminMobileField label="Template">
                  <select
                    value={row.templateId}
                    onChange={(e) =>
                      updateRow(row.handle, { templateId: e.target.value })
                    }
                    className={selectClassName}
                  >
                    <option value="">— Aucun (défaut) —</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.zonesCount} zones)
                      </option>
                    ))}
                  </select>
                </AdminMobileField>

                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={saving === row.handle}
                  onClick={() => {
                    void saveRow(row)
                  }}
                >
                  {saving === row.handle ? (
                    <BiLoaderAlt className="animate-spin" size={14} />
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </AdminMobileCard>
            ))}
          </AdminTableMobile>
        </>
      )}
    </div>
  )
}
