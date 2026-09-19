"use client"

import * as React from "react"

import {
  getConsentStatus,
  isAnalyticsConfigured,
  setConsent,
  type ConsentChoice,
  type ConsentStatus,
} from "@/lib/analytics"

const buttonClass =
  "inline-flex min-h-[40px] items-center justify-center rounded-full border border-brun/40 px-4 py-2 text-base font-semibold leading-none text-brun transition-colors duration-200 hover:bg-brun/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brun/30 focus-visible:ring-offset-2 focus-visible:ring-offset-blanc-casse"

const statusLabels: Record<ConsentStatus, string> = {
  granted: "Tu as accepté les cookies de mesure.",
  denied: "Tu as refusé les cookies. On mesure sans cookie.",
  pending: "Tu n'as pas encore répondu. On mesure sans cookie.",
}

/**
 * Permet de revenir sur son choix depuis la politique de confidentialité :
 * le RGPD demande qu'un retrait soit aussi simple que le consentement.
 */
export function ConsentControls(): JSX.Element | null {
  const [status, setStatus] = React.useState<ConsentStatus | null>(null)

  React.useEffect(() => {
    let isCurrent = true
    void getConsentStatus().then((next) => {
      if (isCurrent) setStatus(next)
    })
    return () => {
      isCurrent = false
    }
  }, [])

  function choose(choice: ConsentChoice): void {
    void setConsent(choice)
    setStatus(choice)
  }

  // Rien à régler s'il n'y a pas de mesure, ou avant l'hydratation.
  if (!isAnalyticsConfigured() || status === null) return null

  return (
    <div className="mt-4 rounded-2xl border border-brun/15 bg-beurre/60 p-5">
      <p className="font-semibold text-brun">{statusLabels[status]}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {status !== "denied" ? (
          <button
            type="button"
            onClick={() => choose("denied")}
            className={buttonClass}
          >
            Refuser les cookies
          </button>
        ) : null}
        {status !== "granted" ? (
          <button
            type="button"
            onClick={() => choose("granted")}
            className={buttonClass}
          >
            Accepter les cookies
          </button>
        ) : null}
      </div>
    </div>
  )
}
