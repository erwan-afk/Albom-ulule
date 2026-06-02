"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

import { Play } from "./icons"
import { Stamp } from "./mockups"

type VideoTileProps = {
  label: string
  /**
   * Image de preview affichée par défaut. Quand la vraie source vidéo
   * sera disponible, on remplace par un `<video>` autoplay muted au hover.
   */
  poster?: string
  posterAlt?: string
  /**
   * Tant que `soon=true`, on affiche le cachet "Bientôt" et l'icône play
   * en gris. Quand on aura les vidéos, on passera à `false`.
   */
  soon?: boolean
  /**
   * Cohérence visuelle : sticker affiché en bas-droite au hover.
   */
  hoverSticker?: string
  className?: string
}

export function VideoTile({
  label,
  poster,
  posterAlt = "",
  soon = true,
  hoverSticker,
  className,
}: VideoTileProps) {
  const reduce = useReducedMotion()
  const [hovered, setHovered] = React.useState(false)

  return (
    <motion.div
      className={cn(
        "group relative aspect-[9/16] overflow-hidden rounded-[6px] bg-brun text-beurre",
        className
      )}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {poster ? (
        <Image
          src={poster}
          alt={posterAlt}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 30%,rgba(186,208,239,.18),transparent 65%),repeating-linear-gradient(135deg,rgba(248,245,202,.04) 0 12px,rgba(248,245,202,.08) 12px 24px)",
          }}
        />
      )}

      {/* Overlay sombre constant pour lisibilité */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-brun/80 via-brun/20 to-transparent"
      />

      {/* Cachet "Bientôt" en diagonale */}
      {soon ? (
        <div className="pointer-events-none absolute right-3 top-3 z-20">
          <Stamp rotation={6} tone="rouge">
            Bientôt
          </Stamp>
        </div>
      ) : null}

      {/* Bouton play */}
      <span
        aria-hidden
        className={cn(
          "absolute left-1/2 top-1/2 inline-flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-beurre/95 text-brun transition-transform duration-300 group-hover:scale-110",
          soon ? "opacity-60" : "opacity-95"
        )}
      >
        <Play size={20} />
      </span>

      {/* Sticker au hover (bas-droite) */}
      {hoverSticker ? (
        <AnimatePresence>
          {hovered && !reduce ? (
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -8 }}
              exit={{ scale: 0, rotate: -20 }}
              transition={{ type: "spring", stiffness: 280, damping: 16 }}
              className="pointer-events-none absolute bottom-12 right-3 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-maya text-center text-[9px] font-bold uppercase leading-tight tracking-[0.18em] text-brun shadow-[0_8px_20px_rgba(73,41,41,0.18)]"
            >
              {hoverSticker}
            </motion.span>
          ) : null}
        </AnimatePresence>
      ) : null}

      {/* Légende en bas */}
      <span className="absolute bottom-3 left-3 right-3 z-10 text-xs font-semibold uppercase tracking-[0.22em] text-beurre/90">
        {label}
      </span>
    </motion.div>
  )
}
