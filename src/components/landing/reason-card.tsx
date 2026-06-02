"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

type ReasonCardProps = {
  icon: React.ReactNode
  title: string
  desc: string
  /**
   * Sticker / annotation qui apparaît au hover, en cohérence avec la raison.
   */
  sticker: {
    label: string
    tone: "maya" | "beurre" | "brun"
    rotation?: number
  }
  className?: string
}

/**
 * Card "raison d'acheter" : contenu lisible par défaut, et un petit sticker
 * supplémentaire qui se révèle au hover comme une annotation manuscrite.
 */
export function ReasonCard({
  icon,
  title,
  desc,
  sticker,
  className,
}: ReasonCardProps) {
  const reduce = useReducedMotion() ?? false
  const [hovered, setHovered] = React.useState(false)
  const stickerPalette = {
    maya: "bg-maya text-brun",
    beurre: "bg-beurre text-brun",
    brun: "bg-brun text-beurre",
  }[sticker.tone]

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-[8px] bg-beurre p-6",
        className
      )}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-brun text-beurre">
        {icon}
      </span>
      <h3 className="text-xl font-semibold leading-snug text-brun">{title}</h3>
      <p className="text-base leading-relaxed text-brun/75">{desc}</p>

      {/* Sticker caché au hover */}
      <AnimatePresence>
        {(hovered || reduce) && (
          <motion.span
            aria-hidden
            initial={reduce ? false : { scale: 0, rotate: sticker.rotation ?? -10 }}
            animate={{ scale: 1, rotate: sticker.rotation ?? -10 }}
            exit={reduce ? undefined : { scale: 0, rotate: -20 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className={cn(
              "absolute -right-3 -top-3 inline-flex size-16 items-center justify-center rounded-full text-center text-[9px] font-bold uppercase leading-tight tracking-[0.18em] shadow-[0_8px_20px_rgba(73,41,41,0.18)]",
              stickerPalette
            )}
          >
            {sticker.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
