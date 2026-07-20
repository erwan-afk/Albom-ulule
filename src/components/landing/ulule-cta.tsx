import * as React from "react"

import { siteConfig } from "@/config/site"

import { cn } from "@/lib/utils"

import { ArrowRight } from "./icons"

type Variant = "primary" | "maya" | "ghost" | "ghost-light"

const variants: Record<Variant, string> = {
  primary: "bg-brun text-beurre hover:bg-brun-deep focus-visible:ring-brun/40",
  maya: "bg-maya text-brun hover:bg-maya-deep focus-visible:ring-brun/30",
  ghost:
    "bg-transparent text-brun border border-brun/50 hover:bg-brun hover:text-beurre focus-visible:ring-brun/30",
  "ghost-light":
    "bg-transparent text-beurre border border-beurre/40 hover:bg-beurre hover:text-brun focus-visible:ring-beurre/30",
}

type UluleCtaProps = {
  children: React.ReactNode
  variant?: Variant
  size?: "md" | "lg"
  className?: string
  showArrow?: boolean
  /**
   * Par défaut, le bouton pointe vers la campagne Ulule.
   * Pour un lien interne (ancres `#...`) ou un autre lien externe, on
   * peut surcharger via `href`.
   */
  href?: string
  external?: boolean
  ariaLabel?: string
}

export function UluleCta({
  children,
  variant = "primary",
  size = "md",
  className,
  showArrow = true,
  href = siteConfig.ululeUrl,
  external = true,
  ariaLabel,
}: UluleCtaProps) {
  const sizes = {
    md: "px-5 py-2.5 text-[clamp(20px,2.2vw,28px)]",
    lg: "px-6 py-3 text-[clamp(22px,2.4vw,32px)]",
  }
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full font-display font-bold leading-none tracking-[-0.04em] transition-all duration-200 ease-out",
        "hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-blanc-casse",
        sizes[size],
        variants[variant],
        className
      )}
    >
      <span>{children}</span>
      {showArrow ? (
        <span className="transition-transform duration-200 group-hover:translate-x-[3px]">
          <ArrowRight size={18} />
        </span>
      ) : null}
    </a>
  )
}
