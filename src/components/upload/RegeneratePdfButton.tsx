"use client"

import { useState } from "react"
import { regeneratePdf } from "@/actions/order"

import { Button } from "@/components/ui/button"

type RegeneratePdfButtonProps = {
  orderId: string
  fileCount: number
}

export function RegeneratePdfButton({
  orderId,
  fileCount,
}: RegeneratePdfButtonProps) {
  const [generating, setGenerating] = useState(false)

  async function handleRegenerate() {
    setGenerating(true)
    await regeneratePdf(orderId)
    setGenerating(false)
  }

  if (fileCount === 0) return null

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegenerate}
      disabled={generating}
    >
      {generating ? "Génération..." : "Régénérer PDF"}
    </Button>
  )
}
