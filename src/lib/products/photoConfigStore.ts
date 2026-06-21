import fs from "node:fs"
import path from "node:path"

import type { PhotoProductConfig } from "@/lib/shopify/productMetafields"
import { parseRatioLabel, ratioLabelFromFields } from "@/lib/upload/ratio"

const CONFIG_PATH = path.join(process.cwd(), "data/product-photo-config.json")
const MAX_PHOTOS = 50

export type StoredProductPhotoConfig = {
  handle: string
  name: string
  photosRequired: number
  photoRatio: PhotoProductConfig["photoRatio"]
  ratioLabel: string
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
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")) as ConfigFile
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

export function getProductPhotoConfig(
  productHandle?: string | null,
  productName?: string | null
): PhotoProductConfig | null {
  const products = readFile().products
  const handle = productHandle?.trim().toLowerCase()

  if (handle) {
    const byHandle = products.find((p) => p.handle === handle)
    if (byHandle) return storedToPhotoProductConfig(byHandle)
  }

  if (productName) {
    const nameLower = productName.trim().toLowerCase()
    const byName = products.find(
      (p) => p.name.trim().toLowerCase() === nameLower
    )
    if (byName) return storedToPhotoProductConfig(byName)
  }

  return null
}

export function upsertProductPhotoConfig(input: {
  handle: string
  name: string
  photosRequired: number
  ratioLabel?: string
  ratioWidth?: string | number
  ratioHeight?: string | number
  ratioFree?: boolean
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

  const entry: StoredProductPhotoConfig = {
    handle,
    name,
    photosRequired,
    photoRatio: ratio.photoRatio,
    ratioLabel: ratio.ratioLabel,
    updatedAt: Date.now(),
  }

  const data = readFile()
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
