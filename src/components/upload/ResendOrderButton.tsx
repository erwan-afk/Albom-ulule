"use client"

import { useState } from "react"
import { resendOrderLink } from "@/actions/order"

import { Button } from "@/components/ui/button"

type ResendOrderButtonProps = {
  orderId: string
}

export function ResendOrderButton({ orderId }: ResendOrderButtonProps) {
  const [sending, setSending] = useState(false)

  async function handleResend() {
    setSending(true)
    await resendOrderLink(orderId)
    setSending(false)
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
