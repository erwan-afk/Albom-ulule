"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, InfoCircledIcon } from "@radix-ui/react-icons"

import { sessionPdfFilename } from "@/lib/photo-session/names"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type OrderSessionInfoProps = {
  sessionToken: string
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="flex items-start gap-1.5">
        <code className="flex-1 break-all rounded bg-muted px-2 py-1 text-[11px] leading-snug">
          {value}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Copier"
        >
          {copied ? (
            <CheckIcon className="size-3.5 text-green-600" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}

export function OrderSessionInfo({
  sessionToken,
}: OrderSessionInfoProps): JSX.Element {
  const shortId = `${sessionToken.slice(0, 8)}…`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
        >
          <InfoCircledIcon className="size-3" />
          Session {shortId}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3" align="start">
        <div>
          <p className="text-sm font-semibold">Dossier session</p>
          <p className="text-xs text-muted-foreground">
            Photos + PDF au même endroit (local et R2).
          </p>
        </div>
        <CopyField label="ID session (token)" value={sessionToken} />
        <CopyField label="Local" value={`uploads/${sessionToken}/`} />
        <CopyField label="R2" value={`sessions/${sessionToken}/`} />
        <CopyField
          label="PDF"
          value={`sessions/${sessionToken}/${sessionPdfFilename(sessionToken)}`}
        />
      </PopoverContent>
    </Popover>
  )
}
