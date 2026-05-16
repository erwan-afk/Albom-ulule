"use client"

import { useState } from "react"
import { updateOrder, type UpdateOrderInput } from "@/actions/order"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProductSelector } from "@/components/upload/ProductSelector"
import type { Order, OrderFile } from "@prisma/client"

type OrderWithFiles = Order & { files: OrderFile[] }

type EditOrderDialogProps = {
  order: OrderWithFiles
}

export function EditOrderDialog({ order }: EditOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail)
  const [customerName, setCustomerName] = useState(order.customerName || "")
  const [productName, setProductName] = useState(order.productName || "")
  const [productHandle, setProductHandle] = useState(order.productHandle || "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerEmail) return

    setSaving(true)

    const input: UpdateOrderInput = {
      id: order.id,
      customerEmail,
      customerName: customerName || undefined,
      productName: productName || undefined,
      productHandle: productHandle || undefined,
    }

    const result = await updateOrder(input)

    if (result.success) {
      setOpen(false)
    }

    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la commande</DialogTitle>
          <DialogDescription>
            Modifiez les informations de la commande. Le token de dépôt reste
            inchangé.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-customerEmail">Email du client *</Label>
            <Input
              id="edit-customerEmail"
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="client@exemple.fr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-customerName">Nom du client</Label>
            <Input
              id="edit-customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
