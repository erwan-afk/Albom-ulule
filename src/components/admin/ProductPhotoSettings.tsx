"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { BiLoaderAlt } from "react-icons/bi"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
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

type RowState = {
  handle: string
  name: string
  photosRequired: number
  ratioWidth: string
  ratioHeight: string
  ratioFree: boolean
  configured: boolean
  orderCount: number
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
  catalog: CatalogItem[]
): RowState[] {
  const map = new Map<string, RowState>()

  for (const item of catalog) {
    map.set(item.handle, {
      handle: item.handle,
      name: item.name,
      photosRequired: 1,
      ratioWidth: "",
      ratioHeight: "",
      ratioFree: true,
      configured: false,
      orderCount: item.orderCount,
    })
  }

  for (const cfg of configs) {
    const existing = map.get(cfg.handle)
    const ratio = fieldsFromRatioLabel(cfg.ratioLabel)
    map.set(cfg.handle, {
      handle: cfg.handle,
      name: cfg.name,
      photosRequired: cfg.photosRequired,
      ratioWidth: ratio.width,
      ratioHeight: ratio.height,
      ratioFree: ratio.free,
      configured: true,
      orderCount: existing?.orderCount ?? 0,
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
  }
}

export function ProductPhotoSettings() {
  const [rows, setRows] = useState<RowState[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setRows(buildRows(data.configs ?? [], data.catalog ?? []))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const unconfiguredCount = useMemo(
    () => rows.filter((r) => !r.configured).length,
    [rows]
  )

  const updateRow = (handle: string, patch: Partial<RowState>) => {
    setRows((prev) =>
      prev.map((row) => (row.handle === handle ? { ...row, ...patch } : row))
    )
  }

  const saveRow = async (row: RowState) => {
    setSaving(row.handle)
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowPayload(row)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur de sauvegarde")
      await fetchData()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(null)
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
    <div className="min-w-0 rounded-xl border bg-card p-4 sm:p-6">
      <h2 className="mb-1 text-lg font-bold text-foreground">
        Photos par produit
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Quand tu crées une commande, le produit apparaît ici tout seul. Tu choisis
        combien de photos le client doit envoyer, et la taille de recadrage (en
        mm). Puis tu cliques Enregistrer.
        {unconfiguredCount > 0 && (
          <span className="mt-1 block text-amber-600 dark:text-amber-400">
            {unconfiguredCount} produit{unconfiguredCount > 1 ? "s" : ""} pas
            encore réglé{unconfiguredCount > 1 ? "s" : ""} — par défaut le client
            n&apos;envoie qu&apos;1 photo.
          </span>
        )}
      </p>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Aucun produit pour l&apos;instant. Crée d&apos;abord une commande en
          haut de page — le produit apparaîtra ici automatiquement.
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
                    <td className="px-4 py-3 font-medium">{row.name}</td>
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
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={saving === row.handle}
                        onClick={() => saveRow(row)}
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
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{row.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {row.orderCount} commande{row.orderCount > 1 ? "s" : ""}
                  </span>
                </div>

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

                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={saving === row.handle}
                  onClick={() => saveRow(row)}
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
