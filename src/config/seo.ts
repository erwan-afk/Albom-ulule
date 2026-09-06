import type { Metadata } from "next"

/** Pages internes (auth, dashboard, upload) : crawl OK pour voir le noindex, pas d’indexation. */
export const noIndexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
}
