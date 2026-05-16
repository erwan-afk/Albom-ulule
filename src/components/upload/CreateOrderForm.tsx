"use client"

import { useRef, useState } from "react"
import { createOrder, sendOrderLink } from "@/actions/order"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProductSelector } from "@/components/upload/ProductSelector"

export function CreateOrderForm(): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null)
  const [productName, setProductName] = useState("")
  const [productHandle, setProductHandle] = useState("")
  const [sending, setSending] = useState(false)

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        setSending(true)
        const customerEmail = formData.get("customerEmail") as string
        const customerName = formData.get("customerName") as string

        if (!customerEmail) return

        const result = await createOrder({
          customerEmail,
          customerName: customerName || undefined,
          productName: productName || undefined,
          productHandle: productHandle || undefined,
        })

        if (result.success && result.order) {
          await sendOrderLink(result.order.id)
        }

        formRef.current?.reset()
        setProductName("")
        setProductHandle("")
        setSending(false)
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email du client *</Label>
          <Input
            id="customerEmail"
            name="customerEmail"
            type="email"
            required
            placeholder="client@exemple.fr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerName">Nom du client</Label>
          <Input
            id="customerName"
            name="customerName"
            placeholder="Jean Dupont"
          />
        </div>
        <div className="space-y-2">
          <Label>Produit Shopify</Label>
          <ProductSelector
            value={productName}
            onChange={(value, product) => {
              setProductName(value)
              setProductHandle(product?.handle ?? "")
            }}
          />
        </div>
      </div>
      <Button type="submit" disabled={sending}>
        {sending ? "Création..." : "Créer la commande et envoyer le lien"}
      </Button>
    </form>
  )
}
