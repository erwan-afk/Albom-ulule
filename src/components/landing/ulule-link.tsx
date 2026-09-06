"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { useUluleUrl } from "./ulule-url-provider"

export function UluleLink({
  className,
  children,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>): JSX.Element {
  const ululeUrl = useUluleUrl()

  return (
    <a
      {...props}
      href={href ?? ululeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className)}
    >
      {children}
    </a>
  )
}
