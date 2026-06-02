"use client"

import * as React from "react"

import { siteConfig } from "@/config/site"

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { UluleCta } from "./ulule-cta"

export function MobileMenu() {
  const [open, setOpen] = React.useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Ouvrir le menu"
        className="inline-flex size-10 items-center justify-center rounded-full border border-brun/20 text-brun transition-colors hover:bg-brun hover:text-beurre md:hidden"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-l-0 bg-blanc-casse text-brun [&_button[aria-label=Close]]:text-brun"
      >
        <SheetTitle className="font-display text-[44px] leading-none text-brun">
          albom
        </SheetTitle>
        <nav
          aria-label="Navigation principale"
          className="mt-8 flex flex-col gap-1"
        >
          {siteConfig.navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg p-3 text-lg font-medium text-brun transition-colors hover:bg-maya/40"
            >
              {item.title}
            </a>
          ))}
        </nav>
        <div className="mt-8">
          <UluleCta size="lg" className="w-full justify-center">
            Soutenir sur Ulule
          </UluleCta>
        </div>
      </SheetContent>
    </Sheet>
  )
}
