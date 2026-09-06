"use client"

import { useState } from "react"
import { resendOrderLink } from "@/actions/order"

import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"

type ResendOrderButtonProps = {
  orderId: string
}

export function ResendOrderButton({ orderId }: ResendOrderButtonProps) {
  const { toast } = useToast()
  const [sending, setSending] = useState(false)

  async function handleResend() {
    setSending(true)
    const result = await resendOrderLink(orderId)
    setSending(false)

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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResend}
      disabled={sending}
    >
      {sending ? "Envoi..." : "Renvoyer lien"}
    </Button>
  )
}
