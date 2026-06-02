import * as React from "react"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="min-h-screen bg-blanc-casse text-brun antialiased">
      {children}
    </div>
  )
}
