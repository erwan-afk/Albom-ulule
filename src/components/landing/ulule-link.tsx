"use client"

import * as React from "react"

import { track } from "@/lib/analytics"
import { cn } from "@/lib/utils"

import { useUluleUrl } from "./ulule-url-provider"

type UluleLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Emplacement du CTA dans la page, pour savoir lequel convertit. */
  trackingLocation?: string
}

export function UluleLink({
  className,
  children,
  href,
  trackingLocation,
  onClick,
  ...props
}: UluleLinkProps): JSX.Element {
  const ululeUrl = useUluleUrl()

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>): void {
    // `href` surchargé = autre destination : pas un CTA Ulule.
    if (href === undefined) {
      track("ulule_cta_clicked", {
        location: trackingLocation ?? "non-precise",
      })
    }
    onClick?.(event)
  }

  return (
    <a
      {...props}
      href={href ?? ululeUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(className)}
    >
      {children}
    </a>
  )
}
