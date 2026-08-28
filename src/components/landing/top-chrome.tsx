"use client"

import * as React from "react"
import { useLenis } from "@studio-freight/react-lenis"

import { LogoAlbom } from "@/components/landing/logo"
import { UluleIcon } from "@/components/landing/icons"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

const headerButtonClass =
  "inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-transparent bg-brun px-5 py-2.5 font-display text-[clamp(20px,2.2vw,28px)] font-bold leading-none tracking-[-0.04em] text-blanc-casse transition-all duration-200 hover:bg-brun-deep hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brun/40 focus-visible:ring-offset-2 focus-visible:ring-offset-blanc-casse"

const bannerBodyClass = "font-normal text-brun"
const bannerLinkClass =
  "font-bold text-brun underline decoration-2 underline-offset-2 transition-opacity hover:opacity-70"

const navLinks = [
  { href: "#contenu", label: "Contenu" },
  { href: "#concept", label: "Concept" },
  { href: "#avantages", label: "Avantages" },
  { href: "#a-propos", label: "À propos" },
] as const

/** Offset pour laisser un peu d’air sous le header sticky. */
const NAV_SCROLL_OFFSET = -80

export function TopChrome() {
  const [isBannerOpen, setIsBannerOpen] = React.useState(true)
  const lenis = useLenis()

  function handleNavClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    event.preventDefault()
    const target = document.querySelector(href)
    if (!target) return

    if (lenis) {
      lenis.scrollTo(target, { offset: NAV_SCROLL_OFFSET })
    } else {
      const top =
        target.getBoundingClientRect().top + window.scrollY + NAV_SCROLL_OFFSET
      window.scrollTo({ top, behavior: "smooth" })
    }

    window.history.replaceState(null, "", href)
  }

  return (
    <>
      {isBannerOpen ? (
        <div className="fixed left-0 right-0 top-0 z-[60] bg-beurre text-brun">
          <div className="mx-auto flex min-h-14 w-full max-w-[1512px] items-center justify-center px-4 py-2.5 sm:px-8">
            <div className="inline-flex max-w-full items-start gap-1 sm:items-center">
              <p className="text-center text-sm font-normal leading-snug sm:text-base">
                <a
                  href={siteConfig.ululeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={bannerLinkClass}
                >
                  Soutiens Albom
                </a>
                <span className={bannerBodyClass}>
                  {" "}
                  dans le lancement de sa campagne Ulule, édition bord de mer,
                  et gagne pleeein de{" "}
                </span>
                <a
                  href={siteConfig.ululeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={bannerLinkClass}
                >
                  contreparties
                </a>
                <span className={bannerBodyClass}>.</span>
              </p>
              <button
                type="button"
                aria-label="Fermer le bandeau"
                onClick={() => setIsBannerOpen(false)}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-brun transition-colors hover:bg-brun/10"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
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
        </div>
      ) : null}

      <header
        className={cn(
          "pointer-events-none fixed left-0 right-0 z-50 transition-all duration-200",
          isBannerOpen ? "top-[72px]" : "top-4"
        )}
      >
        <div className="mx-auto flex w-full max-w-[1512px] justify-center px-4 sm:px-8">
          <div className="pointer-events-auto flex w-full max-w-[868px] items-center justify-between gap-3 rounded-full bg-blanc-casse/95 pb-2 pl-6 pr-2 pt-2 shadow-[0_4px_14px_rgba(103,58,54,0.06)] backdrop-blur">
            <LogoAlbom className="shrink-0 text-brun" height={40} />
            <nav
              aria-label="Sections"
              className="hidden min-w-0 flex-1 items-center justify-center gap-4 md:flex lg:gap-5"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link.href)}
                  className="whitespace-nowrap text-base font-medium text-brun underline decoration-transparent decoration-1 underline-offset-[5px] transition-[text-decoration-color] hover:decoration-brun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brun/40 focus-visible:ring-offset-2 focus-visible:ring-offset-blanc-casse"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <a
              href={siteConfig.ululeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(headerButtonClass, "shrink-0")}
            >
              <UluleIcon size={24} className="shrink-0" />
              Soutenir sur Ulule
            </a>
          </div>
        </div>
      </header>
    </>
  )
}
