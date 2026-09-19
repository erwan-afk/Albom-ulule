import { siteConfig } from "@/config/site"

const orgId = `${siteConfig.url}/#organization`
const websiteId = `${siteConfig.url}/#website`
const productId = `${siteConfig.url}/#product`

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": orgId,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.ogImage}`,
    email: "contact@albom.fr",
    sameAs: [
      siteConfig.links.instagram,
      siteConfig.links.tiktok,
      siteConfig.links.pinterest,
    ],
    founder: {
      "@type": "Person",
      name: "Charlotte",
    },
  }
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: "fr-FR",
    publisher: { "@id": orgId },
  }
}

export function productJsonLd() {
  return {
    "@type": "Product",
    "@id": productId,
    name: `Albom — Kit créatif ${siteConfig.edition.name}`,
    description: siteConfig.description,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    brand: { "@id": orgId },
    url: siteConfig.url,
  }
}

export function publicGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd(), websiteJsonLd()],
  }
}
