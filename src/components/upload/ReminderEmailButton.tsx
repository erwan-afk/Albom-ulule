"use client"

import { useState } from "react"
import { sendReminderEmail } from "@/actions/order"

import { Button } from "@/components/ui/button"

type ReminderEmailButtonProps = {
  orderId: string
}

export function ReminderEmailButton({ orderId }: ReminderEmailButtonProps) {
  const [sending, setSending] = useState(false)

  async function handleReminder() {
    setSending(true)
    await sendReminderEmail(orderId)
    setSending(false)
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
