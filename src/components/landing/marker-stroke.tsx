"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

type MarkerStrokeProps = {
  children: React.ReactNode
  className?: string
  /**
   * Couleur du marker. Par défaut, maya (cohérent avec le hero).
   */
  color?: "maya" | "beurre" | "brun"
  /**
   * Si `true`, l'animation se joue dès l'entrée dans le viewport.
   * Si `false`, le trait est statique (déjà tracé).
   */
  animateOnView?: boolean
  /**
   * Décalage vertical du trait (en em) par rapport à la baseline.
   */
  offset?: number
}

/**
 * Un mot/phrase souligné par un trait au marqueur, tracé en SVG via
 * `stroke-dasharray`. Le tracé s'anime quand l'élément entre dans le
 * viewport. Désactivé si l'utilisateur a `prefers-reduced-motion`.
 */
export function MarkerStroke({
  children,
  className,
  color = "maya",
  animateOnView = true,
  offset = 0.12,
}: MarkerStrokeProps) {
  const prefersReducedMotion = useReducedMotion()
  const palette = {
    maya: "#C0DFFF",
    beurre: "#F8F5CA",
    brun: "#673A36",
  }[color]

  const shouldAnimate = animateOnView && !prefersReducedMotion

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden
        className="absolute inset-x-0 z-0 h-[0.5em] w-full"
        style={{ bottom: `${offset}em` }}
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 4 6 Q 50 2 100 5 T 196 4"
          fill="none"
          stroke={palette}
          strokeWidth="8"
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0 } : { pathLength: 1 }}
          whileInView={shouldAnimate ? { pathLength: 1 } : undefined}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.9,
            ease: [0.65, 0, 0.35, 1],
            delay: 0.15,
          }}
        />
      </svg>
    </span>
  )
}
