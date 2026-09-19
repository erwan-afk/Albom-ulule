"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DotsVerticalIcon } from "@radix-ui/react-icons"
import type { Order, OrderFile } from "@prisma/client"

import {
  deleteOrder,
  regeneratePdf,
  resendOrderLink,
  sendReminderEmail,
} from "@/actions/order"
import { Button } from "@/components/ui/button"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditOrderDialog } from "@/components/upload/EditOrderDialog"
import { useToast } from "@/hooks/use-toast"

type OrderWithFiles = Order & { files: OrderFile[] }

type OrderActionsMenuProps = {
  order: OrderWithFiles
}

export function OrderActionsMenu({ order }: OrderActionsMenuProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function handleResend() {
    setBusy(true)
    const result = await resendOrderLink(order.id)
    setBusy(false)

    if (!result.success) {
      toast({
        title: "Email non envoyé",
        description: result.error ?? "Réessaie dans un instant.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Lien renvoyé",
      description: "L'email de dépôt a bien été envoyé.",
    })
  }

  async function handleReminder() {
    setBusy(true)
    const result = await sendReminderEmail(order.id)
    setBusy(false)

    if (!result.success) {
      toast({
        title: "Relance non envoyée",
        description: result.error ?? "Réessaie dans un instant.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Relance envoyée",
      description: "L'email de rappel a bien été envoyé.",
    })
  }

  async function handleRegenerate() {
    setBusy(true)
    const result = await regeneratePdf(order.id)
    setBusy(false)
    if (result.success) {
      toast({ title: "PDF régénéré" })
      router.refresh()
      return
    }
    toast({
      title: "Échec de la génération",
      description: result.error ?? "Réessaie dans un instant.",
      variant: "destructive",
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Actions de la commande"
            disabled={busy}
          >
            <DotsVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onSelect={() => {
              setTimeout(() => setEditOpen(true), 0)
            }}
          >
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={busy}
            onSelect={() => {
              void handleResend()
            }}
          >
            Renvoyer lien
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={busy}
            onSelect={() => {
              void handleReminder()
            }}
          >
            Relance email
          </DropdownMenuItem>
          {order.files.length > 0 ? (
            <DropdownMenuItem
              disabled={busy}
              onSelect={() => {
                void handleRegenerate()
              }}
            >
              Régénérer PDF
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              setTimeout(() => setDeleteOpen(true), 0)
            }}
          >
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditOrderDialog
        order={order}
        open={editOpen}
        onOpenChange={setEditOpen}
        hideTrigger
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer la commande ?"
        description={
          <>
            Tu es sur le point de supprimer la commande
            {order.customerName ? (
              <>
                {" "}
                de <strong>{order.customerName}</strong>
              </>
            ) : null}
            . Cette action est <strong>irréversible</strong> : la commande, les
            photos, le PDF et tous les dossiers associés (local et cloud) seront
            définitivement effacés.
          </>
        }
        onConfirm={async () => {
          await deleteOrder(order.id)
        }}
      />
    </>
  )
}
