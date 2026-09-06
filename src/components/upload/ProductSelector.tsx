"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"

type ProductOption = {
  handle: string
  name: string
}

type ProductSelectorProps = {
  valueHandle: string
  valueName: string
  onChange: (name: string, handle: string) => void
  autoSelectFirst?: boolean
}

export function ProductSelector({
  valueHandle,
  valueName,
  onChange,
  autoSelectFirst = false,
}: ProductSelectorProps): JSX.Element {
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" })
      const data = (await res.json()) as {
        configs?: ProductOption[]
        catalog?: ProductOption[]
      }
      const map = new Map<string, ProductOption>()

      for (const cfg of data.configs ?? []) {
        map.set(cfg.handle, { handle: cfg.handle, name: cfg.name })
      }

      for (const item of data.catalog ?? []) {
        const already = [...map.values()].some(
          (p) =>
            p.handle === item.handle ||
            p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
        )
        if (!already) {
          map.set(item.handle, { handle: item.handle, name: item.name })
        }
      }

      setProducts(
        [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"))
      )
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!autoSelectFirst || valueHandle || products.length === 0) return
    const first = products[0]
    if (!first) return
    onChange(first.name, first.handle)
  }, [autoSelectFirst, onChange, products, valueHandle])

  const options = useMemo(() => {
    const list = [...products]
    if (
      valueHandle &&
      !list.some((p) => p.handle === valueHandle)
    ) {
      list.unshift({ handle: valueHandle, name: valueName || valueHandle })
    }
    return list
  }, [products, valueHandle, valueName])

  return (
    <select
      value={valueHandle}
      onChange={(event) => {
        const handle = event.target.value
        const product = options.find((p) => p.handle === handle)
        onChange(product?.name ?? "", handle)
      }}
      onFocus={() => void load()}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      )}
    >
      <option value="">
        {loading ? "Chargement…" : "Choisir un produit…"}
      </option>
      {options.length === 0 && !loading ? (
        <option value="" disabled>
          Aucun produit — ajoute-en un dans le tableau Produits
        </option>
      ) : null}
      {options.map((product) => (
        <option key={product.handle} value={product.handle}>
          {product.name}
        </option>
      ))}
    </select>
  )
}
