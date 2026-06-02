import * as React from "react"

type IconProps = {
  size?: number
  className?: string
}

const base: React.SVGAttributes<SVGElement> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
}

export function ArrowRight({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...base}
      className={className}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function Play({ size = 22, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
    >
      <path fill="currentColor" d="M8 5.5v13l11-6.5z" />
    </svg>
  )
}

export function Truck({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...base}
      className={className}
    >
      <path d="M2 7h12v10H2z" />
      <path d="M14 10h5l3 3v4h-8" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}

export function Lock({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...base}
      className={className}
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export function Leaf({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...base}
      className={className}
    >
      <path d="M20 4c0 8-6 14-14 14" />
      <path d="M20 4c-9 0-14 5-14 14" />
    </svg>
  )
}

export function Mail({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...base}
      className={className}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  )
}

export function Heart({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...base}
      className={className}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export function Instagram({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...base}
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
    </svg>
  )
}

export function Tiktok({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
    >
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
}

export function Pinterest({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      {...base}
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M11 21c0-3 1-5 1-7s-1-3 .5-3.5S15 12 14 15" />
    </svg>
  )
}

export function Burst({ size = 36, className }: IconProps) {
  // Petit sticker en étoile irrégulière, dans l'esprit "post-it / sticker".
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      aria-hidden
      className={className}
    >
      <path
        fill="currentColor"
        d="M30 2 35 14l13-3-5 12 12 7-12 3 5 13-13-3-5 13-5-13-13 3 5-13-12-3 12-7-5-12 13 3z"
      />
    </svg>
  )
}
