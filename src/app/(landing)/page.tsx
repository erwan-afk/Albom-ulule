"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

// ─── font helper ──────────────────────────────────────────────────────────
// Shorthand so every serif element doesn't repeat the full arbitrary value
const S = "[font-family:var(--font-dm-serif)]"

// ─── icons ────────────────────────────────────────────────────────────────
function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const s = size
  const st = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }
  switch (name) {
    case "arrow":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...st}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )
    case "play":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path fill="currentColor" d="M8 5.5v13l11-6.5z" />
        </svg>
      )
    case "search":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...st}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      )
    case "bag":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...st}>
          <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      )
    case "user":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...st}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
        </svg>
      )
    case "truck":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...st}>
          <path d="M2 7h12v10H2z" />
          <path d="M14 10h5l3 3v4h-8" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
      )
    case "lock":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...st}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      )
    case "leaf":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...st}>
          <path d="M20 4c0 8-6 14-14 14" />
          <path d="M20 4c-9 0-14 5-14 14" />
        </svg>
      )
    case "mail":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...st}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 7 9-7" />
        </svg>
      )
    case "instagram":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...st}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
        </svg>
      )
    case "tiktok":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M14 4v9.5a3 3 0 1 1-3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M14 4c.5 2.5 2.2 4 4.5 4.2"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )
    case "pinterest":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" {...st}>
          <circle cx="12" cy="12" r="9" />
          <path d="M11 21c0-3 1-5 1-7s-1-3 .5-3.5S15 12 14 15" />
        </svg>
      )
    default:
      return null
  }
}

// ─── shared components ────────────────────────────────────────────────────
function Arrow() {
  return (
    <span className="inline-block transition-transform duration-200 group-hover:translate-x-[3px]">
      <Icon name="arrow" size={16} />
    </span>
  )
}

function Btn({
  children,
  variant = "default",
  className = "",
  type = "button",
  onClick,
}: {
  children: React.ReactNode
  variant?: "default" | "ghost" | "maya"
  className?: string
  type?: "button" | "submit"
  onClick?: () => void
}) {
  const base =
    "group inline-flex items-center gap-[10px] px-[26px] py-4 rounded-full border-0 text-[14px] font-medium tracking-[.02em] cursor-pointer transition-all duration-200 hover:-translate-y-px"
  const variants = {
    default: "bg-[#492929] text-[#F7ECDD] hover:bg-[#2c1818]",
    ghost:
      "bg-transparent text-[#492929] border border-[#492929] hover:bg-[#492929] hover:text-[#F7ECDD]",
    maya: "bg-[#BAD0EF] text-[#492929] hover:bg-[#a4c3ea]",
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

function Wrap({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto max-w-[1400px] px-10 ${className}`}>
      {children}
    </div>
  )
}

function IconBtn({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      className="relative inline-flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-[#492929]/[.18] bg-transparent text-[#492929] transition-colors duration-200 hover:bg-[#492929] hover:text-[#F7ECDD]"
    >
      {children}
    </button>
  )
}

// ─── top bar ──────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <div className="bg-[#492929] text-[12px] tracking-[.04em] text-[#F7ECDD]">
      <div className="flex items-center justify-between gap-6 px-10 py-[10px]">
        <div className="inline-flex items-center gap-[10px]">
          <span>Livraison offerte dès 29€</span>
          <span className="opacity-40">·</span>
          <span>
            Code{" "}
            <span className="rounded bg-[#BAD0EF] px-2 py-[2px] font-semibold tracking-[.06em] text-[#492929]">
              PRINTEMPS
            </span>{" "}
            · –10% sur ton premier albom
          </span>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="opacity-70">Excellent</span>
          <div className="inline-flex gap-[2px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="inline-block h-[14px] w-[14px] bg-[#00b67a]"
                style={{
                  clipPath:
                    "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
                }}
              />
            ))}
          </div>
          <span>
            <strong className="text-white">4,9</strong> · 412 avis
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── nav ──────────────────────────────────────────────────────────────────
function Nav() {
  const { data: session } = useSession()
  const links = [
    "L'albom",
    "Comment ça marche",
    "Exemples",
    "Histoire",
    "Journal",
  ]
  return (
    <nav className="sticky top-0 z-[60] border-b border-[#492929]/[.08] bg-[#F7ECDD] backdrop-blur-[8px]">
      <div className="flex items-center justify-between px-10 py-[18px]">
        <div className="flex items-center gap-[42px]">
          <a
            href="#"
            className={`${S} text-[30px] leading-none tracking-[-0.02em] text-[#492929]`}
          >
            albom
          </a>
          <div className="flex gap-[30px] text-[14px] text-[#492929]">
            {links.map((link) => (
              <a
                key={link}
                href="#"
                className="relative border-b border-transparent py-[6px] transition-colors duration-150 hover:border-[#492929]"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-5">
          {session ? (
            <a
              href="/dashboard"
              className="text-[14px] font-medium text-[#492929] underline-offset-4 hover:underline"
            >
              Dashboard
            </a>
          ) : (
            <a
              href="/signin"
              className="text-[14px] font-medium text-[#492929] underline-offset-4 hover:underline"
            >
              Se connecter
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}

// ─── hero ─────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="grid min-h-[78vh] grid-cols-[1.05fr_1fr] bg-[#F7ECDD] max-[980px]:grid-cols-1">
      <div className="relative overflow-hidden bg-[#492929] max-[980px]:min-h-[50vh]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(135deg,rgba(247,236,221,.04) 0 12px,rgba(247,236,221,.07) 12px 24px),radial-gradient(circle at 30% 40%,#5b3535 0%,#2e1818 70%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute left-[60px] top-[90px] h-[170px] w-[140px] -rotate-[7deg] rounded-[2px] shadow-[0_24px_60px_rgba(0,0,0,.4)]"
            style={{
              background:
                "repeating-linear-gradient(90deg,#e9d6bb 0 8px,#f6ead0 8px 16px)",
            }}
          />
          <div
            className="absolute right-[80px] top-[140px] h-[150px] w-[120px] rotate-[6deg] rounded-[2px] shadow-[0_24px_60px_rgba(0,0,0,.4)]"
            style={{
              background:
                "repeating-linear-gradient(90deg,#cdb497 0 8px,#dec3a3 8px 16px)",
            }}
          />
          <div
            className="absolute bottom-[110px] right-[140px] h-[140px] w-[110px] -rotate-[10deg] rounded-[2px] shadow-[0_24px_60px_rgba(0,0,0,.4)]"
            style={{
              background:
                "repeating-linear-gradient(90deg,#a98a76 0 8px,#bd9f8a 8px 16px)",
            }}
          />
        </div>
        <button
          className="duration-[250ms] absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-[#F7ECDD]/90 text-[#492929] shadow-[0_20px_60px_rgba(0,0,0,.35)] transition-transform hover:scale-[1.06]"
          aria-label="Lire la vidéo"
        >
          <Icon name="play" size={28} />
        </button>
        <div className="absolute bottom-7 left-8 text-[12px] uppercase tracking-[.16em] text-[#F7ECDD] opacity-75">
          <strong className="font-medium">Le film d&apos;un albom</strong> ·
          1:24
        </div>
      </div>

      <div className="relative flex flex-col justify-center gap-9 px-16 py-[88px] max-[980px]:px-7 max-[980px]:py-14">
        <div className="flex items-center gap-[14px] text-[#492929]">
          <span className="h-[6px] w-[6px] flex-none rounded-full bg-[#492929]" />
          <span className="text-[11px] uppercase tracking-[.14em]">
            Édition printemps · 2026
          </span>
        </div>

        <h1
          className={`${S} m-0 text-[clamp(48px,7.2vw,116px)] font-normal leading-[.92] tracking-[-0.012em]`}
        >
          Tes souvenirs
          <br />
          méritent <em className={`${S} italic text-[#492929]`}>mieux</em>
          <br />
          qu&apos;une{" "}
          <span className="rounded bg-[#BAD0EF] px-[.1em]">pellicule</span>.
        </h1>

        <p className="m-0 max-w-[46ch] text-[17px] leading-[1.55] text-[#5d3a3a]">
          Albom, c&apos;est un magazine souvenir à compléter à la main. Tu y
          glisses tes photos, tu griffonnes tes anecdotes, tu couvres les pages
          de stickers et de couleurs.
        </p>

        <div className="flex flex-wrap items-center gap-[22px]">
          <Btn>
            Commander mon albom <Arrow />
          </Btn>
          <div className="flex flex-col leading-[1.1]">
            <strong className={`${S} text-[32px] font-normal`}>39€</strong>
            <small className="text-[11px] tracking-[.06em] opacity-70">
              Livraison offerte
            </small>
          </div>
        </div>

        <div className="flex flex-wrap gap-8 text-[13px] text-[#492929]">
          {[
            ["1 200+", "aloms en circulation"],
            ["48h", "préparé à la main"],
            ["FR", "imprimé en France"],
          ].map(([val, label]) => (
            <span key={label}>
              <strong
                className={`${S} block text-[22px] font-normal leading-none`}
              >
                {val}
              </strong>
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── valeurs strip ────────────────────────────────────────────────────────
function Values() {
  const items = [
    "CRÉATIVITÉ",
    "SOUVENIRS",
    "QUALITÉ",
    "EXPÉRIENCE",
    "DURABILITÉ",
  ]
  return (
    <div className="bg-[#BAD0EF] py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-6 px-10">
        {items.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-[18px] text-[13px] font-medium tracking-[.22em] text-[#492929]"
          >
            {v}
            {i < items.length - 1 && (
              <span className="inline-block h-[7px] w-[7px] rounded-full border border-[#492929]" />
            )}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── breakdown produit ────────────────────────────────────────────────────
function Breakdown() {
  const photos = [
    {
      style: {
        left: 30,
        top: 30,
        width: 90,
        height: 110,
        background:
          "repeating-linear-gradient(90deg,#cfb495 0 8px,#dec3a3 8px 16px)",
      },
    },
    {
      style: {
        left: 140,
        top: 50,
        width: 90,
        height: 80,
        background:
          "repeating-linear-gradient(45deg,#7a9bbf 0 8px,#9bb6d4 8px 16px)",
      },
    },
    {
      style: {
        left: 280,
        top: 30,
        width: 100,
        height: 120,
        background:
          "repeating-linear-gradient(135deg,#a87f6a 0 8px,#bd9485 8px 16px)",
        transform: "rotate(3deg)",
      },
    },
    {
      style: {
        left: 400,
        top: 60,
        width: 90,
        height: 100,
        background:
          "repeating-linear-gradient(0deg,#5b3535 0 8px,#6e4444 8px 16px)",
        transform: "rotate(-2deg)",
      },
    },
    {
      style: {
        left: 50,
        top: 200,
        width: 130,
        height: 90,
        background:
          "repeating-linear-gradient(45deg,#bad0ef 0 8px,#cdddef 8px 16px)",
        transform: "rotate(-3deg)",
      },
    },
    {
      style: {
        left: 300,
        top: 200,
        width: 80,
        height: 90,
        background:
          "repeating-linear-gradient(135deg,#cfb495 0 8px,#dec3a3 8px 16px)",
        transform: "rotate(4deg)",
      },
    },
  ]
  const labels = [
    {
      pos: "left-[40px] top-[80px] text-right",
      num: "01 —",
      title: "1 albom à remplir",
      desc: "148 pages, papier épais 170g",
    },
    {
      pos: "right-[40px] top-[60px] text-left",
      num: "02 —",
      title: "Tes photos",
      desc: "celles du voyage, des potes, du dimanche",
    },
    {
      pos: "left-[30px] bottom-[60px] text-right",
      num: "03 —",
      title: "Une planche de stickers",
      desc: "imprimés exclusivement pour albom",
    },
    {
      pos: "right-[30px] bottom-[80px] text-left",
      num: "04 —",
      title: "3 feutres de couleur",
      desc: "doux et précis pour griffonner",
    },
  ]
  return (
    <section className="relative overflow-hidden bg-[#F7ECDD] py-[130px]">
      <Wrap>
        <span className="mb-[18px] block text-center text-[11px] font-medium uppercase tracking-[.18em] text-[#492929] opacity-55">
          · La box ·
        </span>
        <h2
          className={`${S} m-0 mx-auto max-w-[18ch] text-center text-[clamp(36px,5.2vw,76px)] font-normal leading-[1.02] tracking-[-0.01em]`}
        >
          Tout ce qu&apos;il te faut
          <br />
          pour <em className={`${S} italic`}>prendre ton temps</em>.
        </h2>

        <div className="relative mx-auto my-[90px] mb-[60px] h-[520px] max-w-[1100px]">
          <div className="absolute left-1/2 top-1/2 h-[380px] w-[560px] -translate-x-1/2 -translate-y-1/2">
            <div
              className="absolute left-[30px] top-[10px] h-[360px] w-[520px] -rotate-[4deg] rounded-[6px] border border-[#492929]/[.08] shadow-[0_40px_80px_rgba(73,41,41,.18),0_8px_16px_rgba(73,41,41,.06)]"
              style={{
                background: "linear-gradient(180deg,#fbf5ea 0%,#e9d8be 100%)",
              }}
            >
              <div className="absolute bottom-0 left-1/2 top-0 w-[2px] bg-[#492929]/[.12]" />
              {[60, 120, 180, 240, 300].map((t) => (
                <div
                  key={t}
                  className="absolute left-1/2 h-[14px] w-[6px] -translate-x-1/2 rounded-[2px] bg-[#a89280]"
                  style={{ top: t }}
                />
              ))}
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={p.style as React.CSSProperties}
                />
              ))}
            </div>

            <div
              className="absolute bottom-[30px] left-[80px] h-[140px] w-[120px] -rotate-[12deg] border-[6px] border-b-[24px] border-[#fbf5ea] shadow-[0_16px_40px_rgba(0,0,0,.2)]"
              style={{
                background:
                  "repeating-linear-gradient(45deg,#c9a787 0 10px,#dbbf9e 10px 20px)",
              }}
            />

            <div
              className="absolute left-[240px] top-[30px] h-[200px] w-[24px] rotate-[20deg] rounded shadow-[0_18px_36px_rgba(0,0,0,.25)]"
              style={{
                background: "linear-gradient(180deg,#3a1f1f 0%,#7a4848 100%)",
              }}
            >
              <div className="absolute -top-[12px] left-0 right-0 h-[14px] rounded-t-[4px] bg-[#BAD0EF]" />
            </div>

            <div className="absolute -right-[30px] bottom-[30px] flex h-[200px] w-[160px] rotate-[8deg] items-center justify-center rounded bg-[#BAD0EF] text-[14px] font-semibold tracking-[.3em] text-[#492929] shadow-[0_16px_40px_rgba(73,41,41,.18)]">
              STICKERS
            </div>
          </div>

          {labels.map((l, i) => (
            <div
              key={i}
              className={`absolute ${l.pos} max-w-[170px] text-[13px] leading-[1.35] text-[#492929]`}
            >
              <span
                className={`${S} mb-1 block text-[14px] tracking-[.04em] opacity-55`}
              >
                {l.num}
              </span>
              <strong className="block text-[15px] font-medium">
                {l.title}
              </strong>
              <span>{l.desc}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-[18px]">
          <Btn>
            Composer ma box <Arrow />
          </Btn>
          <span className="text-[13px] text-[#5d3a3a] opacity-70">
            à partir de 39€ · livraison incluse
          </span>
        </div>
      </Wrap>
    </section>
  )
}

// ─── comment ça fonctionne ────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Tu commandes",
      tag: "Étape 1",
      d: "Choisis ta couverture, ton format. La box arrive chez toi sous 48h.",
      bg: "radial-gradient(circle at 40% 60%,#bad0ef55,transparent 60%),repeating-linear-gradient(135deg,rgba(247,236,221,.05) 0 12px,rgba(247,236,221,.08) 12px 24px)",
    },
    {
      n: "02",
      t: "Tu sélectionnes",
      tag: "Étape 2",
      d: "Trie tes photos, imprime celles que tu veux. On t'offre 30 tirages.",
      bg: "radial-gradient(circle at 70% 50%,#f7ecdd33,transparent 60%),repeating-linear-gradient(45deg,rgba(186,208,239,.06) 0 12px,rgba(186,208,239,.1) 12px 24px)",
    },
    {
      n: "03",
      t: "Tu remplis",
      tag: "Étape 3",
      d: "Pose-toi un dimanche. Colle, griffonne, raconte. Aucune règle.",
      bg: "radial-gradient(circle at 30% 30%,#bad0ef33,transparent 60%),repeating-linear-gradient(90deg,rgba(247,236,221,.04) 0 8px,rgba(247,236,221,.08) 8px 16px)",
    },
    {
      n: "04",
      t: "Tu gardes (ou offres)",
      tag: "Étape 4",
      d: "L'objet unique se range dans ta bibliothèque ou file à quelqu'un.",
      bg: "radial-gradient(circle at 60% 70%,#f7ecdd22,transparent 60%),repeating-linear-gradient(135deg,rgba(186,208,239,.06) 0 16px,rgba(186,208,239,.1) 16px 32px)",
    },
  ]
  return (
    <section className="bg-[#492929] py-[130px] text-[#F7ECDD]">
      <Wrap>
        <span className="mb-[18px] block text-center text-[11px] font-medium uppercase tracking-[.18em] text-[#BAD0EF]">
          · Le rituel ·
        </span>
        <h2
          className={`${S} m-0 mx-auto max-w-[16ch] text-center text-[clamp(36px,5.2vw,76px)] font-normal leading-[1.02] tracking-[-0.01em] text-[#F7ECDD]`}
        >
          Comment ça fonctionne.
        </h2>
        <div className="mt-20 grid grid-cols-4 gap-6 max-[820px]:grid-cols-2">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col gap-[18px]">
              <span
                className={`${S} text-[18px] italic tracking-[.04em] text-[#BAD0EF]`}
              >
                — {step.n}
              </span>
              <div className="relative aspect-[3/4] overflow-hidden rounded border border-[#F7ECDD]/[.08] bg-[#5b3535]">
                <div
                  className="absolute inset-0"
                  style={{ background: step.bg }}
                />
                <span className="absolute bottom-[14px] left-[14px] text-[11px] uppercase tracking-[.14em] text-[#F7ECDD] opacity-70">
                  {step.tag}
                </span>
              </div>
              <h3
                className={`${S} m-0 text-[24px] font-normal leading-[1.1] text-[#F7ECDD]`}
              >
                {step.t}
              </h3>
              <p className="m-0 text-[14px] leading-[1.55] text-[#F7ECDD]/[.78]">
                {step.d}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-[60px] flex justify-center">
          <Btn variant="maya">
            Démarrer mon albom <Arrow />
          </Btn>
        </div>
      </Wrap>
    </section>
  )
}

// ─── exemples / résultats ─────────────────────────────────────────────────
function Results() {
  const vids = [
    {
      t: "Le road-trip Sicile",
      v: "82k vues",
      badge: "viral",
      bg: "radial-gradient(circle at 30% 30%,#7a4f4f,#2c1717),repeating-linear-gradient(45deg,rgba(186,208,239,.06) 0 14px,rgba(186,208,239,.12) 14px 28px)",
    },
    {
      t: "Un an avec Léo",
      v: "21k vues",
      badge: undefined,
      bg: "radial-gradient(circle at 70% 40%,#9c7a64,#3a1f1f)",
    },
    {
      t: "Mariage d'Anaïs",
      v: "44k vues",
      badge: undefined,
      bg: "radial-gradient(circle at 40% 60%,#bad0ef33,#492929)",
    },
    {
      t: "L'année des copines",
      v: "18k vues",
      badge: "neuf",
      bg: "radial-gradient(circle at 60% 30%,#d6b89a44,#2c1717)",
    },
  ]
  return (
    <section className="bg-[#F7ECDD] py-[130px]">
      <Wrap>
        <div className="mb-[60px] flex flex-wrap items-end justify-between gap-10">
          <h2
            className={`${S} m-0 max-w-[14ch] text-[clamp(36px,5.2vw,76px)] font-normal leading-[1.02] tracking-[-0.01em]`}
          >
            Quelques exemples
            <br />
            de <em className={`${S} italic`}>résultats</em>.
          </h2>
          <p className="m-0 max-w-[34ch] text-[14px] leading-[1.55] text-[#5d3a3a]">
            Tous les aloms sont uniques. Voilà ce qu&apos;ont fait celles et
            ceux qui se sont déjà laissés tenter — et ce qu&apos;on partage sur
            nos réseaux.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-[18px] max-[820px]:grid-cols-2">
          {vids.map((v, i) => (
            <div
              key={i}
              className="duration-[250ms] group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-[6px] bg-[#3a1f1f] transition-transform hover:-translate-y-1"
            >
              <div className="absolute inset-0" style={{ background: v.bg }} />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg,transparent 40%,rgba(0,0,0,.6) 100%)",
                }}
              />
              {v.badge && (
                <span className="absolute left-3 top-3 rounded-full bg-[#BAD0EF] px-2 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-[#492929]">
                  {v.badge}
                </span>
              )}
              <div className="duration-[250ms] absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F7ECDD]/90 text-[#492929] transition-transform group-hover:scale-[1.08]">
                <Icon name="play" size={22} />
              </div>
              <div className="absolute bottom-[14px] left-[14px] right-[14px] flex items-end justify-between text-[12px] text-[#F7ECDD]">
                <strong
                  className={`${S} mb-[3px] block text-[18px] font-normal leading-[1.1]`}
                >
                  {v.t}
                </strong>
                <span className="text-[11px] tracking-[.04em] opacity-85">
                  {v.v}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[50px] flex flex-wrap items-center justify-center gap-5">
          <Btn variant="ghost">
            Voir tous les aloms <Arrow />
          </Btn>
          <span className="text-[13px] text-[#5d3a3a]">
            @albom.studio · 38k abonnés sur Instagram
          </span>
        </div>
      </Wrap>
    </section>
  )
}

// ─── raisons d'acheter ────────────────────────────────────────────────────
function Reasons() {
  const cards = [
    {
      i: "✦",
      t: "Un moment hors des écrans",
      d: "Deux heures sur ton canapé avec une bougie. Aucun téléphone. Promis.",
    },
    {
      i: "❋",
      t: "Un objet unique à conserver",
      d: "Pas un fichier qui disparaît dans le cloud. Un livre qu'on touche.",
    },
    {
      i: "✿",
      t: "Un cadeau qui a du sens",
      d: "Anniversaire, départ, mariage : l'attention qu'on n'oublie pas.",
    },
    {
      i: "✺",
      t: "Soutenir un projet émergent",
      d: "Albom est imprimé en France, fabriqué main par une équipe de trois.",
    },
  ]
  return (
    <section className="bg-[#BAD0EF] py-[130px]">
      <Wrap>
        <div className="grid grid-cols-[1fr_1.05fr] items-center gap-20 max-[980px]:grid-cols-1 max-[980px]:gap-10">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-[#492929]">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 60%,rgba(247,236,221,.25),transparent 60%),repeating-linear-gradient(135deg,rgba(247,236,221,.05) 0 14px,rgba(247,236,221,.08) 14px 28px)",
              }}
            />
            <div
              className={`${S} absolute bottom-6 left-6 text-[46px] italic leading-none text-[#F7ECDD]`}
            >
              «
              <small className="mt-2 block text-[11px] uppercase not-italic tracking-[.18em] opacity-70 [font-family:var(--font-public-sans,sans-serif)]">
                Albom studio
              </small>
            </div>
          </div>

          <div>
            <span className="mb-[14px] block text-[11px] font-medium uppercase tracking-[.18em] text-[#492929] opacity-60">
              · Pourquoi un albom ·
            </span>
            <h2
              className={`${S} m-0 mb-9 max-w-[14ch] text-[clamp(36px,5.2vw,76px)] font-normal leading-[1.02] tracking-[-0.01em]`}
            >
              Raisons d&apos;acheter
              <br />
              un <em className={`${S} italic`}>albom</em>.
            </h2>
            <p className="m-0 max-w-[46ch] text-[17px] leading-[1.55] text-[#492929] opacity-80">
              Parce que tes souvenirs méritent de continuer à vivre dans un
              format qui te ressemble.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-[14px] max-[560px]:grid-cols-1">
              {cards.map((c, i) => (
                <div
                  key={i}
                  className="flex min-h-[200px] cursor-default flex-col gap-[14px] rounded-[6px] bg-[#F7ECDD] p-[26px_24px] transition-transform duration-200 hover:-translate-y-[3px]"
                >
                  <div
                    className={`${S} flex h-9 w-9 items-center justify-center rounded-full bg-[#BAD0EF] text-lg italic text-[#492929]`}
                  >
                    {c.i}
                  </div>
                  <h3
                    className={`${S} m-0 text-[22px] font-normal leading-[1.1]`}
                  >
                    {c.t}
                  </h3>
                  <p className="m-0 text-[13px] leading-[1.5] text-[#5d3a3a]">
                    {c.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ─── faq ──────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number>(0)
  const items = [
    {
      q: "C'est quoi exactement un albom ?",
      a: "Un magazine-carnet imprimé sur papier épais de 170g, 148 pages, à remplir entièrement à la main. Il arrive vierge — tu décides ce qui rentre dedans : photos, tickets, dessins, écrits, stickers.",
    },
    {
      q: "Combien de photos je peux y mettre ?",
      a: "Compte 80 à 120 photos format polaroïd ou tirages 10×15 selon ta mise en page. Chaque box contient 30 tirages offerts via notre partenaire d'impression.",
    },
    {
      q: "Quels sont les délais de livraison ?",
      a: "Préparation à la main sous 48h ouvrées, livraison Colissimo en 2 à 4 jours en France métropolitaine. Suivi par mail à chaque étape.",
    },
    {
      q: "Je peux l'offrir en cadeau ?",
      a: "Évidemment — c'est même notre premier usage. À la commande, choisis l'option « cadeau » pour un emballage écorce de bouleau et un mot manuscrit.",
    },
    {
      q: "Le papier est-il adapté aux feutres et stickers ?",
      a: "Oui, on a choisi un papier mat 170g testé avec nos feutres : pas de transparence, pas de bavure. Les stickers se décollent et se recollent jusqu'à trois fois.",
    },
    {
      q: "Et si je suis nul·le en collage ?",
      a: "Aucune règle, c'est un peu le principe. On glisse dans chaque box un petit livret « inspiration » avec quatre mises en page si tu veux te lancer doucement.",
    },
    {
      q: "Quelle est votre politique de retour ?",
      a: "Tu as 30 jours pour nous retourner ton albom non utilisé. Au-delà — ou s'il est entamé — on échange contre un avoir. Une question : hello@albom.fr.",
    },
  ]
  return (
    <section className="bg-[#492929] py-[130px] text-[#F7ECDD]">
      <Wrap>
        <div className="grid grid-cols-[.7fr_1.3fr] gap-20 max-[820px]:grid-cols-1 max-[820px]:gap-10">
          <div>
            <span className="mb-4 block text-[11px] font-medium uppercase tracking-[.18em] text-[#BAD0EF]">
              · FAQ ·
            </span>
            <h2
              className={`${S} m-0 text-[clamp(36px,5.2vw,76px)] font-normal leading-[1.02] tracking-[-0.01em] text-[#F7ECDD]`}
            >
              Vos questions
              <br />
              fréquentes.
            </h2>
            <p className="mt-6 max-w-[34ch] text-[14px] leading-[1.55] text-[#F7ECDD]/70">
              On a regroupé ici les questions qu&apos;on reçoit le plus. Si la
              tienne n&apos;y est pas, écris-nous, on répond en moins de 24h.
            </p>
            <span className="mt-[30px] inline-flex items-center gap-2 rounded-full border border-[#F7ECDD]/[.15] bg-[#F7ECDD]/[.08] px-[14px] py-2 text-[12px] text-[#F7ECDD]">
              <Icon name="mail" size={14} /> hello@albom.fr
            </span>
          </div>

          <div className="flex flex-col">
            {items.map((it, i) => (
              <div
                key={i}
                className={`cursor-pointer border-t border-[#F7ECDD]/[.18] py-6 ${i === items.length - 1 ? "border-b" : ""}`}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <div className="flex items-center justify-between gap-6">
                  <h3
                    className={`${S} m-0 text-[24px] font-normal leading-[1.15] transition-colors duration-200 ${open === i ? "text-[#BAD0EF]" : "text-[#F7ECDD]"}`}
                  >
                    {it.q}
                  </h3>
                  <span
                    className={`duration-[250ms] flex-none text-[24px] font-light leading-none text-[#BAD0EF] transition-transform ${open === i ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </div>
                <div
                  className={`duration-[350ms] max-w-[60ch] overflow-hidden text-[15px] leading-[1.6] text-[#F7ECDD]/[.78] transition-all ${open === i ? "mt-[14px] max-h-[400px]" : "max-h-0"}`}
                >
                  {it.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ─── histoire ─────────────────────────────────────────────────────────────
function Story() {
  return (
    <section className="bg-[#F7ECDD] py-[130px]">
      <Wrap>
        <div className="grid grid-cols-2 items-start gap-20 max-[820px]:grid-cols-1 max-[820px]:gap-9">
          <div className="pt-5">
            <span className="mb-6 block text-[11px] font-medium uppercase tracking-[.18em] text-[#492929] opacity-60">
              · Histoire de la marque ·
            </span>
            <h2
              className={`${S} m-0 mb-8 text-[clamp(36px,5.2vw,76px)] font-normal leading-[1.02] tracking-[-0.01em]`}
            >
              Pourquoi j&apos;ai créé
              <br />
              <em className={`${S} italic`}>albom</em>.
            </h2>
            {[
              "J'ai 28 ans et 14 000 photos sur mon téléphone. Que je ne regarde jamais. Un matin de janvier, j'ai retrouvé un vieux carnet de voyage de ma grand-mère — un truc rempli de tickets de train, de fleurs séchées, d'écriture penchée.",
              "Je me suis dit : pourquoi nous, on n'a plus ça ? Pourquoi nos vies tiennent dans un cloud qu'on n'ouvre jamais ? J'ai lancé albom pour qu'on se redonne le temps de poser nos souvenirs ailleurs que sur un écran.",
              "Aujourd'hui on est trois, basés à Lyon, et on imprime chaque albom avec un imprimeur familial à 40 km.",
            ].map((p, i) => (
              <p
                key={i}
                className="m-0 mb-[18px] max-w-[46ch] text-[16px] leading-[1.65] text-[#5d3a3a]"
              >
                {p}
              </p>
            ))}
            <span
              className={`${S} mt-6 block text-[22px] italic text-[#492929]`}
            >
              — Camille, fondatrice
            </span>
          </div>

          <div
            className="relative aspect-[4/5] rotate-[2deg] overflow-hidden rounded-[6px] shadow-[0_30px_60px_rgba(73,41,41,.18)]"
            style={{ background: "linear-gradient(180deg,#d8baa6,#a87f6a)" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 35%,rgba(247,236,221,.25),transparent 60%),repeating-linear-gradient(135deg,rgba(73,41,41,.06) 0 14px,rgba(73,41,41,.1) 14px 28px)",
              }}
            />
            <div
              className={`${S} absolute bottom-5 left-5 text-[28px] italic leading-none text-[#F7ECDD]`}
            >
              Camille
              <small className="mt-[6px] block text-[11px] uppercase not-italic tracking-[.18em] opacity-80 [font-family:var(--font-public-sans,sans-serif)]">
                Fondatrice · Lyon
              </small>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  )
}

// ─── trust strip ──────────────────────────────────────────────────────────
function Trust() {
  const items = [
    {
      ic: "truck",
      t: "Livraison offerte",
      d: "En relai dès 29€. Cadeau au choix dès 50€ & 70€.",
    },
    {
      ic: "lock",
      t: "Paiement sécurisé",
      d: "Carte bancaire · Paypal · Apple Pay · Bancontact",
    },
    {
      ic: "leaf",
      t: "Calage biodégradable",
      d: "Ta commande est protégée par des chips de maïs.",
    },
    {
      ic: "mail",
      t: "Une question ?",
      d: "Écris-nous à hello@albom.fr · réponse en 24h.",
    },
  ]
  return (
    <section className="bg-[#BAD0EF] py-[42px]">
      <Wrap>
        <div className="grid grid-cols-4 gap-[30px] max-[820px]:grid-cols-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full bg-[#F7ECDD] text-[#492929]">
                <Icon name={it.ic} size={20} />
              </span>
              <div>
                <strong className="mb-1 block text-[13px] font-semibold uppercase tracking-[.16em] text-[#492929]">
                  {it.t}
                </strong>
                <p className="m-0 text-[12px] leading-[1.45] text-[#492929] opacity-80">
                  {it.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  )
}

// ─── footer ───────────────────────────────────────────────────────────────
function AlbomFooter() {
  const cols = [
    {
      h: "L'albom",
      links: ["Le produit", "Comment ça marche", "Exemples", "Carte cadeau"],
    },
    { h: "Maison", links: ["Histoire", "Journal", "Ateliers", "Presse"] },
    { h: "Aide", links: ["FAQ", "Livraison", "Retours", "Contact"] },
  ]
  return (
    <footer className="bg-[#492929] pb-[30px] pt-20 text-[13px] text-[#F7ECDD]/80">
      <Wrap>
        <div className="mb-[60px] grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 max-[820px]:grid-cols-2">
          <div>
            <div
              className={`${S} text-[46px] leading-none tracking-[-0.02em] text-[#F7ECDD]`}
            >
              albom
            </div>
            <p className="my-[18px] mb-6 max-w-[34ch] leading-[1.55]">
              Le magazine-souvenir à compléter à la main. Imprimé et préparé en
              France, par une petite équipe.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e: React.FormEvent) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="ton@email.com"
                className="flex-1 rounded-full border border-[#F7ECDD]/30 bg-transparent px-[18px] py-3 text-[13px] text-[#F7ECDD] outline-none placeholder:text-[#F7ECDD]/45 focus:border-[#BAD0EF]"
              />
              <button
                type="submit"
                className="cursor-pointer whitespace-nowrap rounded-full border-0 bg-[#BAD0EF] px-[18px] text-[13px] font-medium text-[#492929]"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>
          {cols.map((col) => (
            <div key={col.h}>
              <h4 className="m-0 mb-[18px] text-[12px] font-semibold uppercase tracking-[.14em] text-[#F7ECDD]">
                {col.h}
              </h4>
              <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="transition-colors hover:text-[#BAD0EF]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[14px] border-t border-[#F7ECDD]/[.18] pt-6 text-[12px]">
          <span>© 2026 albom — Lyon, France</span>
          <div className="flex gap-3">
            {["instagram", "tiktok", "pinterest"].map((name) => (
              <a
                key={name}
                href="#"
                aria-label={name}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#F7ECDD]/30 transition-colors hover:border-[#BAD0EF] hover:bg-[#BAD0EF] hover:text-[#492929]"
              >
                <Icon name={name} size={14} />
              </a>
            ))}
          </div>
          <span className="opacity-50">CGV · Mentions légales · Cookies</span>
        </div>
      </Wrap>
    </footer>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────
export default function LandingPage(): JSX.Element {
  return (
    <>
      <TopBar />
      <Nav />
      <Hero />
      <Values />
      <Breakdown />
      <HowItWorks />
      <Results />
      <Reasons />
      <FAQ />
      <Story />
      <Trust />
      <AlbomFooter />
    </>
  )
}
