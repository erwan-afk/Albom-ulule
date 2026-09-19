"use client"

import * as React from "react"
import Link from "next/link"

import {
  getConsentStatus,
  setConsent,
  type ConsentChoice,
} from "@/lib/analytics"
import { cn } from "@/lib/utils"

const choiceButtonClass =
  "inline-flex min-h-[40px] flex-1 items-center justify-center rounded-full px-4 py-2 text-base font-semibold leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-blanc-casse"

export function CookieBanner(): JSX.Element | null {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasEntered, setHasEntered] = React.useState(false)

  React.useEffect(() => {
    let isCurrent = true
    void getConsentStatus().then((status) => {
      if (!isCurrent || status !== "pending") return
      setIsVisible(true)
      window.requestAnimationFrame(() => {
        if (isCurrent) setHasEntered(true)
      })
    })
    return () => {
      isCurrent = false
    }
  }, [])

  function answer(choice: ConsentChoice): void {
    void setConsent(choice)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <section
      aria-label="Gestion des cookies"
      className={cn(
        "fixed inset-x-4 bottom-4 z-[70] rounded-2xl border border-brun/15 bg-blanc-casse/95 p-5 text-brun shadow-[0_8px_28px_rgba(103,58,54,0.14)] backdrop-blur",
        "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
        "sm:right-auto sm:max-w-[380px]",
        hasEntered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em]">
        Cookies
      </p>
      <p className="mt-3 text-base font-medium leading-[1.35]">
        On mesure l&apos;audience du site sans cookie et sans te suivre ailleurs.
        Si tu acceptes, on en garde un peu plus pour comprendre ce qui te plaît.{" "}
        <Link
          href="/confidentialite"
          className="underline decoration-2 underline-offset-2 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brun/40 focus-visible:ring-offset-2 focus-visible:ring-offset-blanc-casse"
        >
          En savoir plus
        </Link>
      </p>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => answer("denied")}
          className={cn(
            choiceButtonClass,
            "border border-brun/40 bg-transparent hover:bg-brun/5 focus-visible:ring-brun/30"
          )}
        >
          Non merci
        </button>
        <button
          type="button"
          onClick={() => answer("granted")}
          className={cn(
            choiceButtonClass,
            "border border-transparent bg-brun text-blanc-casse hover:bg-brun-deep focus-visible:ring-brun/40"
          )}
        >
          Accepter
        </button>
      </div>
    </section>
  )
}
