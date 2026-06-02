import * as React from "react"

import { cn } from "@/lib/utils"

import { LogoAlbom } from "./logo"

/* -------------------------------------------------------------------------- */
/*  Couverture du magazine — édition Bord de mer                              */
/* -------------------------------------------------------------------------- */

type MagazineCoverProps = {
  className?: string
  /**
   * `closed` : couverture fermée, posée sur la table (état hero / final).
   * `opened` : on simule l'ouverture (utilisé dans la section pack).
   */
  state?: "closed" | "opened"
}

/**
 * Reproduction SVG d'une couverture façon brandboard : papier mat (beurre),
 * un titre éditorial, une illustration trait + 1 sticker maya, le mot
 * "albom" en logotype et la mention "Édition 01".
 *
 * À remplacer par un vrai render print quand Charlotte aura les visuels.
 */
export function MagazineCover({ className, state = "closed" }: MagazineCoverProps) {
  return (
    <svg
      viewBox="0 0 400 520"
      role="img"
      aria-label="Couverture du magazine Albom — édition Bord de mer"
      className={cn("block size-full", className)}
    >
      <defs>
        <linearGradient id="cover-grain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F9F1E0" />
          <stop offset="100%" stopColor="#F0DFC2" />
        </linearGradient>
        <pattern
          id="cover-noise"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <rect width="3" height="3" fill="transparent" />
          <circle cx="1" cy="1" r="0.35" fill="#492929" fillOpacity="0.045" />
        </pattern>
      </defs>

      <g>
        <rect width="400" height="520" rx="6" fill="url(#cover-grain)" />
        <rect width="400" height="520" rx="6" fill="url(#cover-noise)" />

        <rect x="6" y="6" width="388" height="508" rx="3" fill="none" stroke="#492929" strokeOpacity="0.08" />

        <text
          x="40"
          y="58"
          fill="#492929"
          fillOpacity="0.6"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="11"
          fontWeight="600"
          letterSpacing="3"
        >
          ÉDITION 01
        </text>
        <line x1="40" y1="68" x2="120" y2="68" stroke="#492929" strokeOpacity="0.3" strokeWidth="0.8" />

        <text
          x="360"
          y="58"
          fill="#492929"
          fillOpacity="0.6"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="11"
          fontWeight="600"
          letterSpacing="3"
          textAnchor="end"
        >
          FR · 2026
        </text>

        <g transform="translate(40 130)">
          <text
            fill="#492929"
            fontFamily="Georgia, serif"
            fontSize="58"
            fontWeight="700"
            letterSpacing="-2"
          >
            <tspan x="0" y="0">Bord</tspan>
            <tspan x="0" y="62">de mer</tspan>
          </text>
        </g>

        <text
          x="40"
          y="290"
          fill="#492929"
          fillOpacity="0.75"
          fontFamily="ui-sans-serif, system-ui"
          fontSize="13"
          letterSpacing="1"
        >
          Souvenirs, sable, écran solaire.
        </text>

        <g transform="translate(60 340) rotate(-4)" opacity="0.85">
          <path
            d="M 0 50 Q 30 20 70 30 Q 110 40 150 25 Q 200 8 250 30"
            fill="none"
            stroke="#492929"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="0"
          />
          <circle cx="240" cy="35" r="6" fill="#BAD0EF" />
          <path
            d="M 80 40 L 90 30 L 100 45 L 110 35 L 120 48"
            fill="none"
            stroke="#492929"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </g>

        <g transform="translate(305 220) rotate(-14)">
          <circle r="36" fill="#BAD0EF" />
          <text
            fill="#492929"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="9"
            fontWeight="800"
            letterSpacing="2"
            textAnchor="middle"
            y="-4"
          >
            21 PHOTOS
          </text>
          <text
            fill="#492929"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="9"
            fontWeight="800"
            letterSpacing="2"
            textAnchor="middle"
            y="10"
          >
            INCLUSES
          </text>
        </g>

        <g transform="translate(40 460)">
          <g transform="translate(0 0)" color="#492929">
            <LogoAlbom height={28} />
          </g>
          <text
            x="0"
            y="42"
            fill="#492929"
            fillOpacity="0.6"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="10"
            letterSpacing="2"
          >
            LE MAGAZINE-SOUVENIR
          </text>
        </g>

        {state === "opened" ? (
          <g transform="translate(0 0)">
            <line
              x1="200"
              y1="0"
              x2="200"
              y2="520"
              stroke="#492929"
              strokeOpacity="0.18"
              strokeDasharray="2 3"
            />
          </g>
        ) : null}
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Planche de 21 photos (mockup)                                             */
/* -------------------------------------------------------------------------- */

type PhotoSheetProps = {
  className?: string
}

/**
 * Une planche d'autocollants : 7 lignes × 3 colonnes = 21 vignettes photo.
 * Chaque vignette a un petit dégradé soft pour évoquer une image. Le but
 * n'est pas réaliste : c'est un mockup propre, raccord brandboard.
 */
export function PhotoSheet({ className }: PhotoSheetProps) {
  const cells = Array.from({ length: 21 }, (_, i) => i)
  const palettes = [
    ["#BAD0EF", "#9CB7DB"],
    ["#F8F5CA", "#EBE39E"],
    ["#492929", "#2c1717"],
    ["#D7C5A0", "#B59E7A"],
    ["#A5B8C9", "#7E92A5"],
  ]
  return (
    <svg
      viewBox="0 0 240 480"
      role="img"
      aria-label="Planche de 21 photos personnelles imprimées par Albom"
      className={cn("block size-full", className)}
    >
      <defs>
        {palettes.map(([a, b], i) => (
          <linearGradient
            key={i}
            id={`photo-grad-${i}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={b} />
          </linearGradient>
        ))}
      </defs>

      <rect width="240" height="480" rx="8" fill="#F9F9F4" />
      <rect
        x="8"
        y="8"
        width="224"
        height="464"
        rx="4"
        fill="none"
        stroke="#492929"
        strokeOpacity="0.18"
        strokeDasharray="3 3"
      />

      <text
        x="120"
        y="28"
        textAnchor="middle"
        fill="#492929"
        fillOpacity="0.65"
        fontFamily="ui-sans-serif, system-ui"
        fontSize="8"
        fontWeight="700"
        letterSpacing="2"
      >
        21 PHOTOS · BORD DE MER
      </text>

      {cells.map((i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 22 + col * 68
        const y = 44 + row * 60
        const p = i % palettes.length
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width="58"
              height="48"
              rx="2"
              fill={`url(#photo-grad-${p})`}
            />
            <rect
              x={x + 2}
              y={y + 36}
              width="20"
              height="8"
              fill="#F9F9F4"
              fillOpacity="0.65"
            />
          </g>
        )
      })}

      <text
        x="120"
        y="466"
        textAnchor="middle"
        fill="#492929"
        fillOpacity="0.45"
        fontFamily="ui-sans-serif, system-ui"
        fontSize="7"
        letterSpacing="2"
      >
        REPOSITIONNABLE · IMPRIMÉ EN FRANCE
      </text>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Planche de stickers illustrations                                         */
/* -------------------------------------------------------------------------- */

export function StickerSheet({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 320"
      role="img"
      aria-label="Planche de stickers illustrations Bord de mer"
      className={cn("block size-full", className)}
    >
      <rect width="240" height="320" rx="8" fill="#BAD0EF" />
      <rect
        x="8"
        y="8"
        width="224"
        height="304"
        rx="4"
        fill="none"
        stroke="#492929"
        strokeOpacity="0.18"
        strokeDasharray="3 3"
      />

      <text
        x="120"
        y="30"
        textAnchor="middle"
        fill="#492929"
        fontFamily="ui-sans-serif, system-ui"
        fontSize="9"
        fontWeight="700"
        letterSpacing="2"
      >
        STICKERS · ÉDITION 01
      </text>

      <g transform="translate(40 60)" fill="none" stroke="#492929" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 20 Q 10 0 24 8 Q 32 0 40 12 Q 50 24 36 32 Q 20 40 8 32 Q 0 28 0 20Z" fill="#F9F9F4" />
        <path d="M8 18 L 12 22 M 22 14 L 26 18 M 16 26 L 20 30" />
      </g>

      <g transform="translate(140 60)">
        <circle r="22" cx="22" cy="22" fill="#F8F5CA" stroke="#492929" strokeWidth="1.6" />
        <path d="M 8 22 Q 22 10 36 22 Q 22 34 8 22Z" fill="none" stroke="#492929" strokeWidth="1.4" />
        <circle cx="22" cy="22" r="3" fill="#492929" />
      </g>

      <g transform="translate(36 140)">
        <path
          d="M 0 30 Q 0 0 30 0 L 50 0 Q 80 0 80 30 L 80 50 Q 80 80 50 80 L 30 80 Q 0 80 0 50 Z"
          fill="#F9F9F4"
          stroke="#492929"
          strokeWidth="1.6"
        />
        <text
          x="40"
          y="48"
          textAnchor="middle"
          fill="#492929"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontSize="20"
          fontWeight="700"
        >
          salé
        </text>
      </g>

      <g transform="translate(140 150)">
        <path
          d="M 30 0 L 60 30 L 30 60 L 0 30 Z"
          fill="#F8F5CA"
          stroke="#492929"
          strokeWidth="1.6"
        />
        <circle cx="30" cy="30" r="14" fill="none" stroke="#492929" strokeWidth="1.4" />
        <circle cx="30" cy="30" r="5" fill="#492929" />
      </g>

      <g transform="translate(38 230) rotate(-6)" fill="none" stroke="#492929" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="0" y="0" width="70" height="40" rx="20" fill="#F9F9F4" />
        <path d="M 14 20 Q 22 8 30 20 Q 38 32 46 20 Q 54 8 60 20" />
      </g>

      <g transform="translate(146 244) rotate(8)">
        <rect width="60" height="32" rx="4" fill="#F9F9F4" stroke="#492929" strokeWidth="1.4" />
        <text
          x="30"
          y="20"
          textAnchor="middle"
          fill="#492929"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontSize="12"
          fontWeight="700"
        >
          été 26
        </text>
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Feutres                                                                   */
/* -------------------------------------------------------------------------- */

export function Markers({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 80"
      role="img"
      aria-label="Deux feutres marqueurs Albom"
      className={cn("block h-auto w-full", className)}
    >
      <g transform="translate(0 14)">
        <rect x="6" y="12" width="160" height="22" rx="11" fill="#492929" />
        <rect x="6" y="12" width="20" height="22" rx="11" fill="#2c1717" />
        <rect x="158" y="14" width="18" height="18" rx="9" fill="#F8F5CA" />
        <circle cx="176" cy="23" r="3" fill="#492929" />
      </g>
      <g transform="translate(40 42)">
        <rect x="6" y="12" width="160" height="22" rx="11" fill="#BAD0EF" />
        <rect x="6" y="12" width="20" height="22" rx="11" fill="#9CB7DB" />
        <rect x="158" y="14" width="18" height="18" rx="9" fill="#F9F9F4" />
        <circle cx="176" cy="23" r="3" fill="#492929" />
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Tape washi (bande adhésive décorative)                                    */
/* -------------------------------------------------------------------------- */

type WashiTapeProps = {
  className?: string
  /**
   * Couleur principale du tape. Par défaut, beurre semi-transparent.
   */
  tone?: "beurre" | "maya" | "kraft"
  /**
   * Rotation appliquée au tape (degrés).
   */
  rotation?: number
}

export function WashiTape({
  className,
  tone = "beurre",
  rotation = -8,
}: WashiTapeProps) {
  const palette = {
    beurre: { bg: "rgba(248, 245, 202, 0.85)", line: "rgba(73, 41, 41, 0.18)" },
    maya: { bg: "rgba(186, 208, 239, 0.85)", line: "rgba(73, 41, 41, 0.2)" },
    kraft: { bg: "rgba(215, 197, 160, 0.8)", line: "rgba(73, 41, 41, 0.25)" },
  }[tone]
  return (
    <svg
      viewBox="0 0 160 36"
      role="img"
      aria-hidden
      className={cn("block h-auto w-full", className)}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <defs>
        <pattern id={`tape-${tone}`} width="10" height="36" patternUnits="userSpaceOnUse">
          <line x1="5" y1="0" x2="5" y2="36" stroke={palette.line} strokeWidth="1" />
        </pattern>
      </defs>
      <path
        d="M 4 6 L 156 4 L 156 30 L 4 32 Z"
        fill={palette.bg}
      />
      <path
        d="M 4 6 L 156 4 L 156 30 L 4 32 Z"
        fill={`url(#tape-${tone})`}
      />
      <path
        d="M 4 6 L 156 4 L 156 30 L 4 32 Z"
        fill="none"
        stroke="rgba(73, 41, 41, 0.06)"
        strokeWidth="0.5"
      />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*  Cachet diagonal type "Bientôt" / "Édition limitée"                        */
/* -------------------------------------------------------------------------- */

type StampProps = {
  children: React.ReactNode
  className?: string
  rotation?: number
  tone?: "brun" | "rouge"
}

export function Stamp({
  children,
  className,
  rotation = -8,
  tone = "brun",
}: StampProps) {
  const color = tone === "brun" ? "#492929" : "#8C2A2A"
  return (
    <div
      className={cn(
        "inline-flex select-none items-center justify-center px-4 py-2 text-center",
        className
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
        border: `2px solid ${color}`,
        color,
        boxShadow: `0 0 0 2px transparent, inset 0 0 0 3px transparent`,
      }}
    >
      <span
        className="text-xs font-extrabold uppercase tracking-[0.22em]"
        style={{ letterSpacing: "0.22em" }}
      >
        {children}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Petit sticker rond générique (label + couleur)                             */
/* -------------------------------------------------------------------------- */

type StickerBadgeProps = {
  children: React.ReactNode
  className?: string
  tone?: "maya" | "beurre" | "brun"
  rotation?: number
  size?: number
}

export function StickerBadge({
  children,
  className,
  tone = "maya",
  rotation = -12,
  size = 96,
}: StickerBadgeProps) {
  const palette = {
    maya: "bg-maya text-brun",
    beurre: "bg-beurre text-brun",
    brun: "bg-brun text-beurre",
  }[tone]
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-full text-center text-[11px] font-extrabold uppercase leading-tight tracking-[0.18em] shadow-[0_8px_20px_rgba(73,41,41,0.18)]",
        palette,
        className
      )}
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  Polaroid frame                                                            */
/* -------------------------------------------------------------------------- */

type PolaroidProps = {
  children: React.ReactNode
  className?: string
  caption?: string
  rotation?: number
}

export function Polaroid({
  children,
  className,
  caption,
  rotation = 0,
}: PolaroidProps) {
  return (
    <figure
      className={cn(
        "relative inline-flex flex-col bg-[#FAF7F1] p-3 pb-10 shadow-[0_30px_60px_-20px_rgba(73,41,41,0.45)]",
        className
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="relative overflow-hidden bg-brun/10">{children}</div>
      {caption ? (
        <figcaption
          className="absolute inset-x-0 bottom-2 px-3 text-center font-display text-base leading-none text-brun"
          aria-hidden
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
