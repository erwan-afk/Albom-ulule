"use client"

import { deleteOrder } from "@/actions/order"

import { Button } from "@/components/ui/button"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"

type DeleteOrderButtonProps = {
  orderId: string
  customerName?: string | null
}

export function DeleteOrderButton({
  orderId,
  customerName,
}: DeleteOrderButtonProps) {
  return (
    <ConfirmDeleteDialog
      title="Supprimer la commande ?"
      description={
        <>
          Tu es sur le point de supprimer la commande
          {customerName ? (
            <>
              {" "}
              de <strong>{customerName}</strong>
            </>
          ) : null}
          . Cette action est <strong>irréversible</strong> : la commande, les
          photos, le PDF et tous les dossiers associés (local et cloud) seront
          définitivement effacés.
        </>
      }
      onConfirm={async () => {
        await deleteOrder(orderId)
      }}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Supprimer
        </Button>
      }
    />
  )
}
