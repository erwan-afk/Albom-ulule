"use client"

import type { MouseEvent } from "react"

import { cn } from "@/lib/utils"

const SECTIONS = [
  {
    href: "#campagne-ulule",
    label: "Campagne Ulule",
    className: "border-beurre-deep bg-beurre text-brun hover:bg-beurre-deep",
  },
  {
    href: "#nouvelle-commande",
    label: "Nouvelle commande",
    className: "border-maya-deep bg-maya text-brun hover:bg-maya-deep",
  },
  {
    href: "#commandes",
    label: "Commandes",
    className: "border-border bg-transparent text-foreground hover:bg-muted",
  },
  {
    href: "#produits",
    label: "Produits",
    className: "border-border bg-transparent text-foreground hover:bg-muted",
  },
  {
    href: "#templates-pdf",
    label: "Templates PDF",
    className: "border-border bg-transparent text-foreground hover:bg-muted",
  },
] as const

const SCROLL_OFFSET = 32

let scrollFrame = 0

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function scrollToY(targetY: number): void {
  cancelAnimationFrame(scrollFrame)

  if (prefersReducedMotion()) {
    window.scrollTo(0, targetY)
    return
  }

  const startY = window.scrollY
  const distance = targetY - startY
  if (Math.abs(distance) < 2) return

  const duration = Math.min(420, Math.max(220, Math.abs(distance) * 0.32))
  const start = performance.now()
  const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    window.scrollTo(0, startY + distance * easeOutCubic(progress))
    if (progress < 1) scrollFrame = requestAnimationFrame(step)
  }

  scrollFrame = requestAnimationFrame(step)
}

function handleAnchorClick(
  event: MouseEvent<HTMLAnchorElement>,
  href: string
): void {
  event.preventDefault()
  const id = href.slice(1)
  const target = document.getElementById(id)
  if (!target) return

  const targetY = Math.max(
    0,
    target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
  )
  scrollToY(targetY)
  window.history.pushState(null, "", href)
}

export function DashboardSectionNav(): JSX.Element {
  return (
    <nav
      aria-label="Sections du dashboard"
      className="mt-4 flex flex-wrap gap-2"
    >
      {SECTIONS.map((section) => (
        <a
          key={section.href}
          href={section.href}
          onClick={(event) => handleAnchorClick(event, section.href)}
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            section.className
          )}
        >
          {section.label}
        </a>
      ))}
    </nav>
  )
}
