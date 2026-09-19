"use client"

import { useEffect, useState } from "react"
import type { Order, OrderFile } from "@prisma/client"

import { updateOrderWorkflowStatus } from "@/actions/order"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  adminWorkflowColors,
  adminWorkflowItemColors,
  adminWorkflowLabels,
  type AdminOrderWorkflowStatus,
  toAdminWorkflowStatus,
} from "@/lib/order-status"

type OrderWithFiles = Order & { files: OrderFile[] }

type OrderStatusSelectProps = {
  order: OrderWithFiles
}

export function OrderStatusSelect({ order }: OrderStatusSelectProps) {
  const { toast } = useToast()
  const [workflow, setWorkflow] = useState<AdminOrderWorkflowStatus>(() =>
    toAdminWorkflowStatus(order.status)
  )
  const [saving, setSaving] = useState(false)
  const [shipDialogOpen, setShipDialogOpen] = useState(false)
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? "")
  const [pendingWorkflow, setPendingWorkflow] =
    useState<AdminOrderWorkflowStatus | null>(null)

  useEffect(() => {
    setWorkflow(toAdminWorkflowStatus(order.status))
    setTrackingUrl(order.trackingUrl ?? "")
  }, [order.status, order.trackingUrl])

  async function applyWorkflow(
    next: AdminOrderWorkflowStatus,
    tracking?: string
  ) {
    setSaving(true)
    const result = await updateOrderWorkflowStatus(order.id, next, tracking)
    setSaving(false)

    if (!result.success) {
      setWorkflow(toAdminWorkflowStatus(order.status))
      toast({
        variant: "destructive",
        title: "Mise à jour impossible",
        description: result.error,
      })
      return
    }

    setWorkflow(next)
    if (next !== "SHIPPED") {
      setTrackingUrl("")
    }
    toast({
      title: "Statut enregistré",
      description:
        next === "SHIPPED"
          ? "Le client a reçu l'e-mail avec le lien de suivi."
          : adminWorkflowLabels[next],
    })
  }

  function handleWorkflowChange(value: string) {
    const next = value as AdminOrderWorkflowStatus
    if (next === workflow) return

    if (next === "SHIPPED") {
      setPendingWorkflow(next)
      setTrackingUrl(order.trackingUrl ?? "")
      setShipDialogOpen(true)
      return
    }

    void applyWorkflow(next)
  }

  function handleShipDialogOpenChange(open: boolean) {
    setShipDialogOpen(open)
    if (!open) {
      setPendingWorkflow(null)
      setWorkflow(toAdminWorkflowStatus(order.status))
    }
  }

  async function confirmShipment(e: React.FormEvent) {
    e.preventDefault()
    if (pendingWorkflow !== "SHIPPED") return

    setSaving(true)
    const result = await updateOrderWorkflowStatus(
      order.id,
      "SHIPPED",
      trackingUrl
    )
    setSaving(false)

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Expédition non enregistrée",
        description: result.error,
      })
      return
    }

    setWorkflow("SHIPPED")
    setShipDialogOpen(false)
    setPendingWorkflow(null)
    toast({
      title: "Statut enregistré",
      description: "Le client a reçu l'e-mail avec le lien de suivi.",
    })
  }

  return (
    <>
      <div className="space-y-1">
        <Select
          value={workflow}
          onValueChange={handleWorkflowChange}
          disabled={saving}
        >
          <SelectTrigger
            className={cn(
              "h-8 w-[10.5rem] font-semibold text-xs shadow-none",
              adminWorkflowColors[workflow]
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(adminWorkflowLabels) as AdminOrderWorkflowStatus[]).map(
              (key) => (
                <SelectItem
                  key={key}
                  value={key}
                  className={cn("font-medium", adminWorkflowItemColors[key])}
                >
                  {adminWorkflowLabels[key]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        {workflow === "SHIPPED" && order.trackingUrl ? (
          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-[10.5rem] truncate text-[11px] text-primary underline"
          >
            Lien suivi
          </a>
        ) : null}
      </div>

      <Dialog open={shipDialogOpen} onOpenChange={handleShipDialogOpenChange}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Marquer comme expédiée</DialogTitle>
            <DialogDescription>
              Le client recevra un e-mail avec le lien de suivi. Vérifie
              l&apos;URL avant de valider.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              void confirmShipment(e)
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-2">
              <Label htmlFor={`tracking-${order.id}`}>Lien de suivi</Label>
              <Input
                id={`tracking-${order.id}`}
                type="url"
                required
                placeholder="https://..."
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                disabled={saving}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleShipDialogOpenChange(false)}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Envoi…" : "Valider"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
