import { NextRequest, NextResponse } from "next/server"

import { getProducts } from "@/lib/shopify"

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q") ?? undefined

  // Debug
  console.log("Shopify env check:", {
    domain: process.env.SHOPIFY_STORE_DOMAIN,
    token: process.env.SHOPIFY_ADMIN_API_TOKEN?.slice(0, 10) + "...",
    hasDomain: !!process.env.SHOPIFY_STORE_DOMAIN,
    hasToken: !!process.env.SHOPIFY_ADMIN_API_TOKEN,
  })

  try {
    const products = await getProducts({ query })
    return NextResponse.json({ products })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Shopify products error:", message)
    return NextResponse.json({ products: [], error: message }, { status: 200 })
  }
}
