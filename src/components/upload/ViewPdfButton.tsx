"use client"

import { Button } from "@/components/ui/button"
import { sessionPdfR2Key } from "@/lib/photo-session/names"

type ViewPdfButtonProps = {
  status: string
  sessionToken: string
}

/**
 * Bouton pour visualiser le PDF d'une commande.
 * L'URL est dérivée du token de session (pas des notes DB, qui peuvent être écrasées).
 */
export function ViewPdfButton({ status, sessionToken }: ViewPdfButtonProps) {
  const hasPdf = status === "PRINTED" || status === "PHOTOS_UPLOADED"

  if (!hasPdf) return null

  const pdfUrl = `/api/pdf/${sessionPdfR2Key(sessionToken)}`

  return (
    <Button variant="outline" size="sm" asChild>
      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
        Voir PDF
      </a>
    </Button>
  )
}
