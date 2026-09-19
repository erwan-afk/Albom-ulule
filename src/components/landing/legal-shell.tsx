import Link from "next/link"

import { LogoAlbom } from "@/components/landing/logo"
import { UluleIcon } from "@/components/landing/icons"
import { UluleLink } from "@/components/landing/ulule-link"
import { cn } from "@/lib/utils"

const headerButtonClass =
  "inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-transparent bg-brun px-5 py-2.5 font-display text-[clamp(20px,2.2vw,28px)] font-bold leading-none tracking-[-0.04em] text-blanc-casse transition-all duration-200 hover:bg-brun-deep hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brun/40 focus-visible:ring-offset-2 focus-visible:ring-offset-blanc-casse"

const T = {
  display2: "text-[clamp(32px,4vw,56px)] font-bold leading-[0.9] tracking-[-0.06em]",
  body: "text-base leading-relaxed font-medium",
  caption: "text-xs font-semibold uppercase tracking-[0.22em]",
} as const

export function LegalShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <>
      <header className="sticky top-0 z-50 bg-blanc-casse/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1512px] items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            className="rounded-sm text-brun focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brun/40 focus-visible:ring-offset-2"
          >
            <LogoAlbom height={36} />
          </Link>
          <UluleLink
            className={cn(headerButtonClass, "shrink-0")}
            trackingLocation="header-pages-legales"
          >
            Soutenir sur Ulule
            <UluleIcon size={24} className="shrink-0" />
          </UluleLink>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-4 py-14 sm:px-8 sm:py-20">
        <p className={cn(T.caption, "text-brun/50")}>Infos</p>
        <h1 className={cn(T.display2, "mt-3 text-brun")}>{title}</h1>
        <div
          className={cn(
            T.body,
            "mt-8 text-brun/90",
            "[&_a]:underline [&_a]:decoration-brun/30 [&_a]:underline-offset-2 [&_a]:transition-colors hover:[&_a]:decoration-brun",
            "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-snug [&_h2]:text-brun",
            "[&_p+_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
          )}
        >
          {children}
        </div>
      </main>
    </>
  )
}
