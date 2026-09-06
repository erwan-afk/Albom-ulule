import fs from "node:fs"
import path from "node:path"

import type { PhotoProductConfig } from "@/lib/upload/photoConfig"
import { parseRatioLabel, ratioLabelFromFields } from "@/lib/upload/ratio"

const CONFIG_PATH = path.join(process.cwd(), "data/product-photo-config.json")
const MAX_PHOTOS = 50

export type StoredProductPhotoConfig = {
  handle: string
  name: string
  photosRequired: number
  photoRatio: PhotoProductConfig["photoRatio"]
  ratioLabel: string
  templateId?: string
  updatedAt: number
}

type ConfigFile = {
  products: StoredProductPhotoConfig[]
}

function ensureConfigFile(): void {
  const dir = path.dirname(CONFIG_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ products: [] }, null, 2))
  }
}

function readFile(): ConfigFile {
  ensureConfigFile()
  const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")) as ConfigFile
  if (!Array.isArray(parsed.products)) return { products: [] }
  return parsed
}

function writeFile(data: ConfigFile): void {
  ensureConfigFile()
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2))
}

function normalizeHandle(handle: string): string {
  return handle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function uniqueHandle(name: string, taken: string[]): string {
  const base = normalizeHandle(name) || "produit"
  if (!taken.includes(base)) return base
  let i = 2
  while (taken.includes(`${base}-${i}`)) i += 1
  return `${base}-${i}`
}

export function storedToPhotoProductConfig(
  stored: StoredProductPhotoConfig
): PhotoProductConfig {
  const ratio = parseRatioLabel(stored.ratioLabel)
  return {
    photosRequired: Math.min(Math.max(1, stored.photosRequired), MAX_PHOTOS),
    ...ratio,
  }
}

export function listProductPhotoConfigs(): StoredProductPhotoConfig[] {
  return readFile().products.sort((a, b) => a.name.localeCompare(b.name, "fr"))
}

export function getStoredProduct(
  productHandle?: string | null,
  productName?: string | null
): StoredProductPhotoConfig | null {
  const products = readFile().products
  const handle = productHandle?.trim().toLowerCase()

  if (handle) {
    const byHandle = products.find((p) => p.handle === handle)
    if (byHandle) return byHandle
  }

  if (productName) {
    const nameLower = productName.trim().toLowerCase()
    const byName = products.find(
      (p) => p.name.trim().toLowerCase() === nameLower
    )
    if (byName) return byName
  }

  return null
}

export function getProductPhotoConfig(
  productHandle?: string | null,
  productName?: string | null
): PhotoProductConfig | null {
  const stored = getStoredProduct(productHandle, productName)
  return stored ? storedToPhotoProductConfig(stored) : null
}

export function createProductPhotoConfig(
  name: string
): StoredProductPhotoConfig {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Nom produit requis")

  const data = readFile()
  const nameLower = trimmed.toLowerCase()
  if (data.products.some((p) => p.name.trim().toLowerCase() === nameLower)) {
    throw new Error("Un produit avec ce nom existe déjà")
  }

  return upsertProductPhotoConfig({
    handle: uniqueHandle(
      trimmed,
      data.products.map((p) => p.handle)
    ),
    name: trimmed,
    photosRequired: 1,
    ratioFree: true,
  })
}

export function upsertProductPhotoConfig(input: {
  handle: string
  name: string
  photosRequired: number
  ratioLabel?: string
  ratioWidth?: string | number
  ratioHeight?: string | number
  ratioFree?: boolean
  templateId?: string | null
}): StoredProductPhotoConfig {
  const handle = normalizeHandle(input.handle)
  if (!handle) throw new Error("Handle produit invalide")

  const name = input.name.trim()
  if (!name) throw new Error("Nom produit requis")

  const photosRequired = Math.min(
    MAX_PHOTOS,
    Math.max(1, Math.round(input.photosRequired))
  )

  let ratioLabel = input.ratioLabel ?? "libre"
  if (input.ratioWidth !== undefined || input.ratioHeight !== undefined) {
    ratioLabel = ratioLabelFromFields(
      String(input.ratioWidth ?? ""),
      String(input.ratioHeight ?? ""),
      Boolean(input.ratioFree)
    )
  }

  const ratio = parseRatioLabel(ratioLabel)
  const data = readFile()
  const existing = data.products.find((p) => p.handle === handle)

  const nameLower = name.toLowerCase()
  const clash = data.products.find(
    (p) => p.handle !== handle && p.name.trim().toLowerCase() === nameLower
  )
  if (clash) throw new Error("Un produit avec ce nom existe déjà")

  const templateId =
    input.templateId === undefined
      ? existing?.templateId
      : (input.templateId ?? "").trim() || undefined

  const entry: StoredProductPhotoConfig = {
    handle,
    name,
    photosRequired,
    photoRatio: ratio.photoRatio,
    ratioLabel: ratio.ratioLabel,
    ...(templateId ? { templateId } : {}),
    updatedAt: Date.now(),
  }

  const idx = data.products.findIndex((p) => p.handle === handle)
  if (idx >= 0) data.products[idx] = entry
  else data.products.push(entry)

  writeFile(data)
  return entry
}

export function deleteProductPhotoConfig(handle: string): boolean {
  const normalized = normalizeHandle(handle)
  const data = readFile()
  const before = data.products.length
  data.products = data.products.filter((p) => p.handle !== normalized)
  if (data.products.length === before) return false
  writeFile(data)
  return true
}

export { normalizeHandle, MAX_PHOTOS }
