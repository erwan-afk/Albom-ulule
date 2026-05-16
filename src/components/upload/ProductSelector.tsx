"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  CheckIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons"

import type { ShopifyProduct } from "@/lib/shopify"
import { cn } from "@/lib/utils"

import { Input } from "@/components/ui/input"

type ProductSelectorProps = {
  value: string
  onChange: (value: string, product?: ShopifyProduct) => void
}

export function ProductSelector({ value, onChange }: ProductSelectorProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const search = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/shopify/products?q=${encodeURIComponent(q)}`
      )
      const data = await res.json()
      setProducts(data.products ?? [])
      if (data.error) setError(data.error)
    } catch (err) {
      setError("Erreur réseau lors de la recherche.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Charger les produits au focus si la liste est vide
  const handleFocus = () => {
    setOpen(true)
    if (products.length === 0 && !loading) {
      search("")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    setOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v), 300)
  }

  const handleSelect = (product: ShopifyProduct) => {
    setSelectedProduct(product)
    setQuery(product.title)
    setOpen(false)
    onChange(product.title, product)
  }

  const handleClear = () => {
    setSelectedProduct(null)
    setQuery("")
    setOpen(false)
    onChange("")
  }

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Rechercher un produit Shopify..."
          className="cursor-pointer pl-9 pr-8"
        />
        <button
          type="button"
          onClick={() => {
            setOpen((prev) => !prev)
            if (!open && products.length === 0 && !loading) search("")
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {query ? (
            <span
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="text-base leading-none"
            >
              ×
            </span>
          ) : (
            <ChevronDownIcon className="size-4" />
          )}
        </button>
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover shadow-lg">
          {loading && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              Chargement…
            </li>
          )}
          {!loading && products.length === 0 && !error && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              Aucun produit trouvé. Vérifie SHOPIFY_STORE_DOMAIN et
              SHOPIFY_ADMIN_API_TOKEN dans le .env.
            </li>
          )}
          {error && (
            <li className="px-4 py-3 text-sm text-destructive">{error}</li>
          )}
          {products.map((p) => {
            const minPrice = p.priceRange.minVariantPrice
            return (
              <li
                key={p.id}
                onClick={() => handleSelect(p)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted",
                  selectedProduct?.id === p.id && "bg-muted"
                )}
              >
                {p.featuredImage && (
                  <img
                    src={p.featuredImage.url}
                    alt={p.featuredImage.altText ?? ""}
                    className="size-8 shrink-0 rounded border object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {minPrice
                      ? `${minPrice.amount} ${minPrice.currencyCode}`
                      : "Prix inconnu"}
                    {" — "}
                    {p.variants.length} variante(s)
                  </p>
                </div>
                {selectedProduct?.id === p.id && (
                  <CheckIcon className="size-4 shrink-0 text-primary" />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
