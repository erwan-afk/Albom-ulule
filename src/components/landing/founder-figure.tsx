"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

import { WashiTape } from "./mockups"

type FounderFigureProps = {
  src: string
  alt: string
  className?: string
}

/**
 * Polaroid de Charlotte qui dévoile un washi tape sur les coins quand on
 * passe la souris dessus. Reduce motion : tape statique (déjà visible).
 */
export function FounderFigure({ src, alt, className }: FounderFigureProps) {
  const reduce = useReducedMotion() ?? false
  const [hovered, setHovered] = React.useState(false)

  return (
    <motion.figure
      className={cn(
        "relative inline-flex flex-col bg-[#FAF7F1] p-3 pb-12 shadow-[0_30px_60px_-20px_rgba(73,41,41,0.4)]",
        className
      )}
      style={{ transform: "rotate(1.5deg)" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={reduce ? undefined : { rotate: 0 }}
      transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
    >
      {/* Washi tape — coin haut gauche (apparaît au scroll-in, reste visible) */}
      <motion.div
        aria-hidden
        className="absolute left-[-20px] top-[-12px] z-20 w-[130px]"
        initial={reduce ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        whileInView={reduce ? undefined : { opacity: 1, scaleX: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        style={{ transformOrigin: "left center" }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.65, 0, 0.35, 1] }}
      >
        <WashiTape tone="beurre" rotation={-12} />
      </motion.div>

      {/* Washi tape — coin bas droit (apparaît au hover seulement) */}
      <motion.div
        aria-hidden
        className="absolute bottom-[-10px] right-[-22px] z-20 w-[120px]"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={
          reduce
            ? { opacity: 1, scaleX: 1 }
            : hovered
              ? { opacity: 1, scaleX: 1 }
              : { opacity: 0, scaleX: 0 }
        }
        style={{ transformOrigin: "right center" }}
        transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
      >
        <WashiTape tone="maya" rotation={6} />
      </motion.div>

      <div className="relative aspect-[4/5] overflow-hidden bg-brun/10">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover"
        />
      </div>

      <figcaption className="absolute inset-x-0 bottom-3 px-3 text-center font-display text-lg leading-none text-brun">
        Charlotte
      </figcaption>
    </motion.figure>
  )
}
