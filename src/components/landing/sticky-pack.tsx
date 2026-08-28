"use client"

import * as React from "react"
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion"

import { cn } from "@/lib/utils"

import {
  MagazineCover,
  Markers,
  PhotoSheet,
  StickerSheet,
} from "./mockups"

/**
 * Sticky scrollytelling : le magazine reste visible à droite/centre pendant
 * que 4 étapes défilent à gauche. À chaque palier, un élément vient se
 * "coller" sur ou autour du magazine :
 *   1. Le magazine s'ouvre légèrement (rotation)
 *   2. La planche de 21 photos arrive en biais
 *   3. La planche de stickers se pose
 *   4. Les feutres roulent en bas
 *
 * Sur mobile (< md), pas de sticky : on déroule les 4 étapes en colonne.
 */

const STEPS = [
  {
    n: "01",
    title: "Le livret-magazine Bord de mer",
    desc: "Format A5, papier mat 170g. Couverture épaisse, mise en page éditoriale prête à recevoir tes souvenirs.",
    tag: "Inclus",
  },
  {
    n: "02",
    title: "21 photos autocollantes — les tiennes",
    desc: "Après ta commande Ulule, tu nous envoies tes photos. On les imprime sur une planche repositionnable.",
    tag: "Inclus",
  },
  {
    n: "03",
    title: "Une planche de stickers illustrations",
    desc: "Coquillages, vagues, mots-clés, expressions. Pour habiller les pages comme tu le sens.",
    tag: "Inclus",
  },
  {
    n: "04",
    title: "2 feutres marqueurs",
    desc: "Doux, précis, testés sur le 170g. Pas de bavure, pas de transparence. Disponibles en bonus Ulule.",
    tag: "Bonus Ulule",
  },
] as const

export function StickyPack() {
  const prefersReducedMotion = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const [active, setActive] = React.useState(0)

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)))
    if (i !== active) setActive(i)
  })

  const coverRotate = useTransform(scrollYProgress, [0, 0.25], [0, -6])
  const photoY = useTransform(scrollYProgress, [0.2, 0.45], [60, 0])
  const photoOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1])
  const stickerY = useTransform(scrollYProgress, [0.45, 0.7], [80, 0])
  const stickerOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1])
  const markersX = useTransform(scrollYProgress, [0.7, 0.95], [220, 0])
  const markersOpacity = useTransform(scrollYProgress, [0.7, 0.85], [0, 1])

  const noMotion = prefersReducedMotion ?? false

  return (
    <div ref={ref} className="relative">
      <div className="mx-auto grid w-full max-w-screen-xl gap-12 px-5 sm:px-8 md:grid-cols-[1fr_1fr] md:gap-16">
        {/* COLONNE GAUCHE : étapes qui défilent (sticky en desktop, statique mobile) */}
        <div className="flex flex-col gap-10 md:gap-[60vh] md:py-[25vh]">
          {STEPS.map((step, i) => (
            <article
              key={step.n}
              data-active={active === i}
              className="group/step flex flex-col gap-4 transition-opacity duration-500 data-[active=true]:md:opacity-100 data-[active=false]:md:opacity-40 md:max-w-md"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-brun text-xs font-bold text-beurre">
                  {step.n}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.22em]",
                    step.tag === "Bonus Ulule"
                      ? "bg-maya text-brun"
                      : "bg-brun/10 text-brun"
                  )}
                >
                  {step.tag}
                </span>
              </div>
              <h3 className="text-xl font-semibold leading-snug text-brun">
                {step.title}
              </h3>
              <p className="text-base leading-relaxed text-brun/75">
                {step.desc}
              </p>
            </article>
          ))}
        </div>

        {/* COLONNE DROITE : magazine sticky + objets qui se collent */}
        <div className="hidden md:block">
          <div className="sticky top-[12vh] flex h-[76vh] items-center justify-center">
            <div className="relative aspect-[4/5] w-full max-w-[420px]">
              {/* Magazine */}
              <motion.div
                className="absolute inset-0 origin-bottom-left rounded-[6px] shadow-[0_30px_60px_-20px_rgba(103,58,54,0.45)]"
                style={noMotion ? undefined : { rotate: coverRotate }}
              >
                <MagazineCover state={active >= 1 ? "opened" : "closed"} />
              </motion.div>

              {/* Planche photos */}
              <motion.div
                aria-hidden
                className="absolute -right-12 top-12 w-[55%] rotate-[10deg] rounded-[8px] bg-blanc-casse shadow-[0_20px_40px_-12px_rgba(103,58,54,0.4)]"
                style={
                  noMotion
                    ? { opacity: active >= 1 ? 1 : 0 }
                    : { y: photoY, opacity: photoOpacity }
                }
              >
                <PhotoSheet />
              </motion.div>

              {/* Planche de stickers */}
              <motion.div
                aria-hidden
                className="absolute -left-10 bottom-14 w-[48%] -rotate-[8deg] rounded-[8px] shadow-[0_20px_40px_-12px_rgba(103,58,54,0.4)]"
                style={
                  noMotion
                    ? { opacity: active >= 2 ? 1 : 0 }
                    : { y: stickerY, opacity: stickerOpacity }
                }
              >
                <StickerSheet />
              </motion.div>

              {/* Feutres */}
              <motion.div
                aria-hidden
                className="absolute -bottom-6 left-1/2 w-[70%] -translate-x-1/2 rotate-[-4deg]"
                style={
                  noMotion
                    ? { opacity: active >= 3 ? 1 : 0 }
                    : { x: markersX, opacity: markersOpacity }
                }
              >
                <Markers />
              </motion.div>
            </div>
          </div>
        </div>

        {/* MOBILE : visuels statiques entre les étapes */}
        <div className="block md:hidden">
          <div className="grid grid-cols-2 items-center gap-4 py-12">
            <div className="aspect-[4/5] w-full">
              <MagazineCover />
            </div>
            <div className="flex flex-col gap-4">
              <div className="-rotate-3 rounded-[8px] shadow-[0_20px_40px_-12px_rgba(103,58,54,0.3)]">
                <PhotoSheet />
              </div>
              <div className="rotate-2">
                <Markers />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
