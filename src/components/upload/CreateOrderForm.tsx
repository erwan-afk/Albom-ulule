"use client"

import { useCallback, useRef, useState, type FormEvent } from "react"
import { createOrder } from "@/actions/order"

import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProductSelector } from "@/components/upload/ProductSelector"

export function CreateOrderForm(): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()
  const [productName, setProductName] = useState("")
  const [productHandle, setProductHandle] = useState("")
  const [sending, setSending] = useState(false)

  const handleProductChange = useCallback((name: string, handle: string) => {
    setProductName(name)
    setProductHandle(handle)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    const formData = new FormData(event.currentTarget)
    const customerEmail = formData.get("customerEmail") as string
    const customerName = formData.get("customerName") as string

    if (!customerEmail) {
      setSending(false)
      return
    }

    const result = await createOrder({
      customerEmail,
      customerName: customerName || undefined,
      productName: productName || undefined,
      productHandle: productHandle || undefined,
    })

    if (!result.success) {
      toast({
        title: "Commande non créée",
        description: "Réessaie dans un instant.",
        variant: "destructive",
      })
      setSending(false)
      return
    }

    if (!result.emailSent) {
      toast({
        title: "Commande créée, email non envoyé",
        description:
          result.error ??
          "La commande existe : tu peux renvoyer le lien depuis le tableau.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Lien envoyé",
        description: `Email de dépôt envoyé à ${customerEmail}.`,
      })
    }

    formRef.current?.reset()
    setProductName("")
    setProductHandle("")
    setSending(false)
  }

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        void handleSubmit(event)
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
          <Label>Produit</Label>
          <ProductSelector
            valueHandle={productHandle}
            valueName={productName}
            autoSelectFirst
            onChange={handleProductChange}
          />
        </div>
      </div>
      <Button type="submit" disabled={sending}>
        {sending ? "Création..." : "Créer la commande et envoyer le lien"}
      </Button>
    </form>
  )
}
