"use client"

import * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export interface FaqItem {
  q: string
  a: string
}

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-0"
      className="flex flex-col"
    >
      {items.map((it, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="border-t border-beurre/20 last:border-b last:border-beurre/20"
        >
          <AccordionTrigger
            className={
              // Aligné sur le système typo (cf. AGENTS.md §3) : display-3.
              "group flex flex-1 items-center justify-between gap-6 py-6 text-left text-xl font-semibold leading-snug text-beurre transition-colors duration-200 hover:text-maya hover:no-underline data-[state=open]:text-maya [&>svg]:hidden"
            }
          >
            <span>{it.q}</span>
            <span
              aria-hidden
              className="flex-none text-2xl font-light leading-none text-maya transition-transform duration-300 group-data-[state=open]:rotate-45"
            >
              +
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pr-12 text-base leading-relaxed text-beurre/80">
            {it.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
