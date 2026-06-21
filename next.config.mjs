import { withContentlayer } from "next-contentlayer"

import("./src/env.mjs")

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["tsx", "mdx", "ts", "js"],
  swcMinify: false,
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

export default withContentlayer(nextConfig)
