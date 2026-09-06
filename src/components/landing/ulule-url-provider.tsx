"use client"

import * as React from "react"

import { DEFAULT_ULULE_URL } from "@/config/site"

const UluleUrlContext = React.createContext(DEFAULT_ULULE_URL)

export function UluleUrlProvider({
  url,
  children,
}: {
  url: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <UluleUrlContext.Provider value={url}>{children}</UluleUrlContext.Provider>
  )
}

export function useUluleUrl(): string {
  return React.useContext(UluleUrlContext)
}
