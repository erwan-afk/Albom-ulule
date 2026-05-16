function getDomain(): string {
  return (process.env.SHOPIFY_STORE_DOMAIN ?? "").replace(/https?:\/\//, "")
}
function getAccessToken(): string {
  return process.env.SHOPIFY_ADMIN_API_TOKEN ?? ""
}
function getEndpoint(): string {
  const d = getDomain()
  return d ? `https://${d}/admin/api/2024-04/graphql.json` : ""
}

// ─── Types ───────────────────────────────────────────────

export type ShopifyImage = {
  url: string
  altText: string | null
  width: number
  height: number
}

export type ShopifyPrice = { amount: string; currencyCode: string }

export type ShopifyProduct = {
  id: string
  handle: string
  title: string
  description: string
  featuredImage: ShopifyImage | null
  images: ShopifyImage[]
  priceRange: { minVariantPrice: ShopifyPrice; maxVariantPrice: ShopifyPrice }
  variants: ShopifyVariant[]
  metafields: Record<string, string | null>
  tags: string[]
  updatedAt: string
}

export type ShopifyVariant = {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: { name: string; value: string }[]
  price: ShopifyPrice
}

// ─── GraphQL Fetch ───────────────────────────────────────

async function shopifyGql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const domain = getDomain()
  const token = getAccessToken()
  if (!domain || !token) throw new Error("Shopify non configuré")

  const res = await fetch(getEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  })

  const body = await res.json()
  if (body.errors) {
    throw new Error(body.errors[0]?.message ?? JSON.stringify(body.errors))
  }
  return body.data as T
}

// ─── Reshape ─────────────────────────────────────────────

function removeEdges<T>(arr: { edges: { node: T }[] }): T[] {
  return arr.edges.map((e) => e.node)
}

function reshapeImage(
  img: {
    url: string
    altText?: string | null
    width: number
    height: number
  } | null
): ShopifyImage | null {
  if (!img) return null
  return {
    url: img.url,
    altText: img.altText ?? null,
    width: img.width,
    height: img.height,
  }
}

function reshapeProduct(p: Record<string, unknown>): ShopifyProduct {
  const images = removeEdges(
    (p.images as { edges: { node: Record<string, unknown> }[] }) ?? {
      edges: [],
    }
  )
    .map((n) =>
      reshapeImage(
        n as {
          url: string
          altText?: string | null
          width: number
          height: number
        }
      )
    )
    .filter((i): i is ShopifyImage => i !== null)

  const variants = removeEdges(
    (p.variants as { edges: { node: Record<string, unknown> }[] }) ?? {
      edges: [],
    }
  ).map((v) => ({
    id: v.id as string,
    title: (v.title as string) ?? "",
    availableForSale: true,
    selectedOptions:
      (v.selectedOptions as { name: string; value: string }[]) ?? [],
    price: {
      amount: (v.price as string) ?? "0",
      currencyCode: "EUR",
    } as ShopifyPrice,
  }))

  const prv = p.priceRangeV2 as
    | { minVariantPrice: ShopifyPrice; maxVariantPrice: ShopifyPrice }
    | undefined

  const metafields: Record<string, string | null> = {}
  for (const m of (
    p.metafields as
      | {
          edges: {
            node: { namespace: string; key: string; value: string | null }
          }[]
        }
      | undefined
  )?.edges ?? []) {
    metafields[`${m.node.namespace}.${m.node.key}`] = m.node.value
  }

  return {
    id: p.id as string,
    handle: (p.handle as string) ?? "",
    title: (p.title as string) ?? "",
    description: (p.description as string) ?? "",
    featuredImage: reshapeImage(
      p.featuredImage as {
        url: string
        altText?: string | null
        width: number
        height: number
      } | null
    ),
    images,
    priceRange: prv ?? {
      minVariantPrice: { amount: "0", currencyCode: "EUR" },
      maxVariantPrice: { amount: "0", currencyCode: "EUR" },
    },
    variants,
    metafields,
    tags: (p.tags as string[]) ?? [],
    updatedAt: (p.updatedAt as string) ?? "",
  }
}

// ─── Fragment ────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment productFields on Product {
    id handle title description
    featuredImage { url altText width height }
    images(first: 20) { edges { node { url altText width height } } }
    priceRangeV2 { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
    variants(first: 20) { edges { node { id title availableForSale selectedOptions { name value } price } } }
    metafields(first: 10, namespace: "custom") { edges { node { namespace key value } } }
    tags updatedAt
  }
`

// ─── Public API ──────────────────────────────────────────

export async function getProducts({
  query,
  first = 50,
}: { query?: string; first?: number } = {}): Promise<ShopifyProduct[]> {
  const res = await shopifyGql<{
    products: { edges: { node: Record<string, unknown> }[] }
  }>(
    `query($first: Int!, $query: String) { products(first: $first, query: $query) { edges { node { ...productFields } } } } ${PRODUCT_FRAGMENT}`,
    { first, query: query ?? null }
  )
  return removeEdges(res.products).map(reshapeProduct)
}

export async function getProduct(
  handle: string
): Promise<ShopifyProduct | null> {
  const res = await shopifyGql<{
    productByHandle: Record<string, unknown> | null
  }>(
    `query($handle: String!) { productByHandle(handle: $handle) { ...productFields } } ${PRODUCT_FRAGMENT}`,
    { handle }
  )
  return res.productByHandle ? reshapeProduct(res.productByHandle) : null
}

export async function getProductById(
  id: string
): Promise<ShopifyProduct | null> {
  const res = await shopifyGql<{ product: Record<string, unknown> | null }>(
    `query($id: ID!) { product(id: $id) { ...productFields } } ${PRODUCT_FRAGMENT}`,
    { id }
  )
  return res.product ? reshapeProduct(res.product) : null
}
