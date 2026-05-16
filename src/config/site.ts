import { type NavItem, type NavItemFooter } from "@/types"

const links = {
  github: "https://github.com/albom",
  twitter: "https://twitter.com/albom",
  linkedin: "https://www.linkedin.com/company/albom",
  discord: "",
  authorsWebsite: "https://albom.fr",
  authorsGitHub: "https://github.com/albom",
  openGraphImage: "https://albom.fr/images/opengraph-image.png",
}

export const siteConfig = {
  name: "Albom",
  description:
    "Le magazine-souvenir a completer a la main. Tes souvenirs meritent mieux qu'une pellicule.",
  links,
  url: "https://albom.fr",
  ogImage: links.openGraphImage,
  author: "Albom Studio",
  hostingRegion: "fra1",
  keywords: ["albom", "souvenir", "magazine", "photo"],
  navItems: [
    {
      title: "About",
      href: "/about",
    },
    {
      title: "Features",
      href: "/features",
    },
    {
      title: "Pricing",
      href: "/pricing",
    },
    {
      title: "FAQ",
      href: "/faq",
    },
    {
      title: "Blog",
      href: "/blog",
    },
  ] satisfies NavItem[],
  navItemsMobile: [],
  navItemsFooter: [
    {
      title: "Company",
      items: [
        {
          title: "About",
          href: "/about",
          external: false,
        },
        {
          title: "Privacy",
          href: "/privacy",
          external: false,
        },
        {
          title: "Terms",
          href: "/tos",
          external: false,
        },
        {
          title: "Careers",
          href: "/careers",
          external: false,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          title: "Docs",
          href: "/docs",
          external: false,
        },
        {
          title: "FAQ",
          href: "/faq",
          external: false,
        },
        {
          title: "Blog",
          href: "/blog",
          external: false,
        },
        {
          title: "Contact",
          href: "/contact",
          external: false,
        },
      ],
    },
    {
      title: "Inspiration",
      items: [
        {
          title: "Shadcn",
          href: "https://ui.shadcn.com/",
          external: true,
        },
        {
          title: "Taxonomy",
          href: "https://tx.shadcn.com/",
          external: true,
        },
        {
          title: "Skateshop",
          href: "https://skateshop.sadmn.com/",
          external: true,
        },
        {
          title: "Acme Corp",
          href: "https://acme-corp.jumr.dev/",
          external: true,
        },
      ],
    },
  ] satisfies NavItemFooter[],
}
