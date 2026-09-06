import { type NavItem, type NavItemFooter } from "@/types"

/**
 * URL Ulule de repli, utilisée tant qu'aucune URL n'a été enregistrée
 * depuis le dashboard. Le lien réel des CTA est lu en base.
 */
export const DEFAULT_ULULE_URL = "https://fr.ulule.com"
export const ULULE_URL = DEFAULT_ULULE_URL

const links = {
  instagram: "https://www.instagram.com/albom.fr",
  tiktok: "https://www.tiktok.com/@cha.serre",
  pinterest: "https://www.pinterest.com/albom.studio",
  ulule: ULULE_URL,
  contactEmail: "mailto:contact@albom.fr",
  authorsWebsite: "https://albom.fr",
  openGraphImage: "/opengraph-image.png",
  // ─ Hérités du template, conservés pour compat des composants non-landing ─
  github: "https://github.com/albom",
  authorsGitHub: "https://github.com/albom",
}

export const siteConfig = {
  name: "Albom",
  edition: {
    number: "01",
    name: "Bord de mer",
    label: "Édition 01 · Bord de mer",
  },
  description:
    "Albom, c'est l'activité créative pour transformer tes photos en souvenir unique : un kit prêt à compléter, sans écran, sans complexité, juste tes mains et tes meilleurs moments.",
  shortDescription: "L'activité créative pour tes vacances",
  links,
  ululeUrl: ULULE_URL,
  url: "https://albom.fr",
  ogImage: links.openGraphImage,
  author: "Albom Studio",
  hostingRegion: "fra1",
  keywords: [
    "albom",
    "activité créative adulte",
    "kit créatif",
    "loisir créatif",
    "scrapbooking facile",
    "carnet de voyage",
    "souvenirs personnalisés",
    "cadeau fait-main",
    "déconnexion",
    "Ulule",
    "bord de mer",
  ],
  // La nav Figma n'expose que logo + CTA Ulule (pas d'ancres de menu).
  navItems: [] as NavItem[],
  navItemsMobile: [] as NavItem[],
  // Footer éditorial inventé (en attendant mentions finales).
  navItemsFooter: [
    {
      title: "La maison",
      items: [
        { title: "Le concept", href: "#", external: false },
        { title: "Le pack Bord de mer", href: "#", external: false },
        { title: "Comment ça marche", href: "#", external: false },
      ],
    },
    {
      title: "Aide",
      items: [
        { title: "FAQ", href: "#", external: false },
        { title: "Nous écrire", href: links.contactEmail, external: true },
      ],
    },
    {
      title: "Suivre",
      items: [
        { title: "Campagne Ulule", href: ULULE_URL, external: true },
        { title: "Instagram", href: links.instagram, external: true },
        { title: "TikTok", href: links.tiktok, external: true },
        { title: "Pinterest", href: links.pinterest, external: true },
      ],
    },
  ] satisfies NavItemFooter[],
}
