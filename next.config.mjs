import("./src/env.mjs")

/**
 * Host PostHog en amont du proxy `/ingest`. La région se règle donc au seul
 * endroit qu'on renseigne déjà en env, sans la coder en dur ici.
 */
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com"
/** `eu.i.posthog.com` → `eu-assets.i.posthog.com` */
const posthogAssetsHost = posthogHost.replace(
  ".i.posthog.com",
  "-assets.i.posthog.com"
)

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["tsx", "mdx", "ts", "js"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["react-pdf", "pdfjs-dist"],
  experimental: {
    serverComponentsExternalPackages: ["canvas", "pdf-lib", "sharp"],
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  /**
   * Proxy PostHog (région EU) servi depuis notre domaine : sans lui, les
   * bloqueurs de pub coupent l'ingestion pour une bonne part des visiteurs.
   *
   * `skipTrailingSlashRedirect` est indispensable : les endpoints PostHog
   * finissent par un slash (`/e/`, `/s/`), et Next les redirigerait en 308.
   * Or `navigator.sendBeacon()`, utilisé pour les events `$pageleave`, ne suit
   * aucune redirection — on perdrait le taux de scroll sans aucune erreur
   * visible. Vérifié : les pages sans slash final continuent de répondre 200.
   */
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${posthogAssetsHost}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${posthogHost}/:path*`,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
    ],
  },
  webpack: (config, { webpack }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(bufferutil|utf-8-validate)$/,
      })
    )
    return config
  },
}

export default nextConfig
