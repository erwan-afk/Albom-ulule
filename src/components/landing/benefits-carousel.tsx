"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Benefit = {
  title: string
  desc: string
}

export function BenefitsCarousel({ items }: { items: Benefit[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const durationMs = 4500

  React.useEffect(() => {
    const start = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start
      const nextProgress = Math.min(100, (elapsed / durationMs) * 100)
      setProgress(nextProgress)

      if (elapsed >= durationMs) {
        setActiveIndex((prev) => (prev + 1) % items.length)
      }
    }, 80)

    return () => window.clearInterval(timer)
  }, [activeIndex, items.length])

  return (
    <div className="flex h-full flex-col">
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((benefit, idx) => {
          const active = idx === activeIndex
          return (
            <button
              key={benefit.title}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative overflow-hidden rounded-lg p-4 text-left transition-all duration-200",
                active
                  ? "bg-beurre/70"
                  : "bg-blanc-casse hover:bg-beurre/30"
              )}
            >
              <h3 className="font-display text-[40px] font-bold leading-none tracking-[-0.04em] text-brun">
                {benefit.title}
              </h3>
              <p className="mt-2 text-base font-medium leading-[1.35] text-brun/85">
                {benefit.desc}
              </p>
              {active ? (
                <div className="absolute bottom-0 left-0 h-1.5 w-full bg-brun/15">
                  <div
                    className="h-full bg-brun transition-[width] duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
