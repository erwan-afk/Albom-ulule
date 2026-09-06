"use client"

import { useState } from "react"
import { sendReminderEmail } from "@/actions/order"

import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"

type ReminderEmailButtonProps = {
  orderId: string
}

export function ReminderEmailButton({ orderId }: ReminderEmailButtonProps) {
  const { toast } = useToast()
  const [sending, setSending] = useState(false)

  async function handleReminder() {
    setSending(true)
    const result = await sendReminderEmail(orderId)
    setSending(false)

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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReminder}
      disabled={sending}
    >
      {sending ? "Envoi..." : "Relance email"}
    </Button>
  )
}
