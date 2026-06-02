"use client"

import * as React from "react"

import { LogoAlbom } from "@/components/landing/logo"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

const headerButtonClass =
  "inline-flex h-[50px] items-center justify-center rounded-full border border-transparent bg-brun px-7 py-3 text-sm font-semibold text-blanc-casse transition-all duration-200 hover:bg-brun-deep hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brun/40 focus-visible:ring-offset-2 focus-visible:ring-offset-blanc-casse sm:text-base"

const bannerButtonClass =
  "inline-flex items-center justify-center rounded-full border border-brun/20 bg-blanc-casse px-4 py-2 text-xs font-semibold text-brun transition-colors hover:bg-brun hover:text-beurre"

export function TopChrome() {
  const [isBannerOpen, setIsBannerOpen] = React.useState(true)

  return (
    <>
      {isBannerOpen ? (
        <div className="fixed left-0 right-0 top-0 z-[60] bg-beurre text-brun">
          <div className="mx-auto flex h-14 w-full max-w-[1512px] items-center gap-3 px-4 sm:px-8">
            <p className="line-clamp-1 flex-1 text-sm font-semibold sm:text-base">
              Campagne Ulule en ligne - édition Bord de mer
            </p>
            <a
              href={siteConfig.ululeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={bannerButtonClass}
            >
              Voir les contreparties
            </a>
            <button
              type="button"
              aria-label="Fermer le bandeau"
              onClick={() => setIsBannerOpen(false)}
              className="inline-flex size-8 items-center justify-center rounded-full text-brun transition-colors hover:bg-brun/10"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

      <header
        className={cn(
          "pointer-events-none fixed left-0 right-0 z-50 transition-all duration-200",
          isBannerOpen ? "top-[72px]" : "top-4"
        )}
      >
        <div className="mx-auto flex w-full max-w-[1512px] justify-center px-4 sm:px-8">
          <div className="pointer-events-auto flex w-full max-w-[742px] items-center justify-between rounded-full bg-blanc-casse/95 pb-2 pl-4 pr-2 pt-2 shadow-[0_4px_14px_rgba(73,41,41,0.06)] backdrop-blur">
            <LogoAlbom className="text-brun" height={40} />
            <a
              href={siteConfig.ululeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={headerButtonClass}
            >
              Soutenir sur Ulule
            </a>
          </div>
        </div>
      </header>
    </>
  )
}
