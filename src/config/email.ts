import { Resend } from "resend"

import { env } from "@/env.mjs"

export const resend = new Resend(env.RESEND_API_KEY)

/** Nom affiché dans Gmail / Apple Mail. Sans ça, hello@… devient « Hello ». */
export const RESEND_FROM_NAME = "Charlotte de Albom"

export function resendFrom(): string {
  const address = env.RESEND_EMAIL_FROM.trim()
  if (address.includes("<")) return address
  return `${RESEND_FROM_NAME} <${address}>`
}
