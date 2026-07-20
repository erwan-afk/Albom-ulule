import * as React from "react"

import { cn } from "@/lib/utils"

export function AdminTableDesktop({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("hidden min-w-0 md:block", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function AdminTableMobile({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("space-y-3 md:hidden", className)}>{children}</div>
}

export function AdminMobileCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border bg-muted/20 p-4",
        className
      )}
    >
      {children}
    </div>
  )
}

export function AdminMobileField({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  )
}
