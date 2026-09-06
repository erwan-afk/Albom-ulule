import { notFound } from "next/navigation"
import { getOrderByToken } from "@/actions/order"

import { resolveUploadPhotoConfig } from "@/lib/upload/photoConfig"

import { UploadFlow } from "@/components/upload/UploadFlow"

type Props = {
  params: { productHandle: string }
  searchParams: { token?: string }
}

export function generateMetadata({ params }: Props) {
  return {
    title: `Vos photos — ${params.productHandle}`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function UploadPage({ params, searchParams }: Props) {
  const { productHandle } = params
  const token = searchParams.token

  if (!token) return notFound()

  const order = await getOrderByToken(token)
  if (!order) return notFound()

  const config = resolveUploadPhotoConfig({
    productName: order.productName,
    productHandle: order.productHandle ?? productHandle,
  })

  return (
    <UploadFlow
      productTitle={order.productName ?? "Votre commande"}
      productHandle={order.productHandle ?? productHandle}
      token={token}
      config={config}
    />
  )
}
