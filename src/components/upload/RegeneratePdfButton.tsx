"use client"

import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [generating, setGenerating] = useState(false)

  async function handleRegenerate() {
    setGenerating(true)
    const result = await regeneratePdf(orderId)
    setGenerating(false)
    if (result.success) {
      router.refresh()
    }
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
