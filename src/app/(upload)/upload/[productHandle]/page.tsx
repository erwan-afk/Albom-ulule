import { notFound } from "next/navigation"
import { getOrderByToken } from "@/actions/order"

import { getProduct } from "@/lib/shopify"
import { resolveUploadPhotoConfig } from "@/lib/upload/photoConfig"

import { UploadFlow } from "@/components/upload/UploadFlow"

type Props = {
  params: { productHandle: string }
  searchParams: { token?: string }
}

export async function generateMetadata({ params }: Props) {
  return { title: `Vos photos — ${params.productHandle}` }
}

export default async function UploadPage({ params, searchParams }: Props) {
  const { productHandle } = params
  const token = searchParams.token

  if (!token) return notFound()

  // Vérifier la commande
  const order = await getOrderByToken(token)
  if (!order) return notFound()

  // Récupérer le produit Shopify (metafields inclus dans la réponse)
  const product = await getProduct(productHandle)
  const metafields = product?.metafields as Record<string, string> | undefined
  const config = resolveUploadPhotoConfig(
    { productName: order.productName, productHandle },
    metafields
  )

  return (
    <UploadFlow
      productTitle={product?.title ?? order.productName ?? "Votre commande"}
      productHandle={productHandle}
      token={token}
      config={config}
    />
  )
}
