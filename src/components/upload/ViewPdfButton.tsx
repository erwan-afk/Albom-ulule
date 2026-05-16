"use client"

import { Button } from "@/components/ui/button"

type ViewPdfButtonProps = {
  status: string
  notes: string | null
}

/**
 * Extracts the PDF URL from the notes field.
 * Notes format when PDF is generated: "PDF: https://..."
 */
function extractPdfUrl(notes: string | null): string | null {
  if (!notes) return null
  // Capture les URLs absolues (https://) et relatives (/api/pdf/...)
  const match = notes.match(/^PDF:\s*(\S+)/)
  return match ? match[1] ?? null : null
}

/**
 * Bouton pour visualiser le PDF d'une commande.
 *
 * - Si l'URL est trouvee dans les notes : lien actif "Voir PDF"
 * - Si le statut est PRINTED / PHOTOS_UPLOADED sans URL : bouton grise "PDF en cours..."
 * - Sinon : masque
 */
export function ViewPdfButton({ status, notes }: ViewPdfButtonProps) {
  const pdfUrl = extractPdfUrl(notes)
  const hasPdf = status === "PRINTED" || status === "PHOTOS_UPLOADED"

  if (!hasPdf && !pdfUrl) return null

  if (pdfUrl) {
    return (
      <Button variant="outline" size="sm" asChild>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
          Voir PDF
        </a>
      </Button>
    )
  }

  // PDF pas encore disponible mais commande en cours de traitement
  return (
    <Button variant="outline" size="sm" disabled>
      PDF en cours...
    </Button>
  )
}
