import type { Metadata } from "next"
import Image from "next/image"

import { TopChrome } from "@/components/landing/top-chrome"
import { BenefitsCarousel } from "@/components/landing/benefits-carousel"
import { LogoAlbom } from "@/components/landing/logo"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: `${siteConfig.name} — Le magazine-souvenir à compléter à la main`,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Édition 01 · Bord de mer`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
}

const T = {
  display1: "text-[clamp(40px,5.4vw,64px)] font-bold leading-[0.9] tracking-[-0.06em]",
  display2: "text-[clamp(32px,4vw,56px)] font-bold leading-[0.9] tracking-[-0.06em]",
  display3: "text-[clamp(28px,3vw,40px)] font-bold leading-[1.02] tracking-[-0.06em]",
  bodyLead: "text-[20px] leading-[1.3] font-medium",
  body: "text-base leading-[1.35] font-medium",
  caption: "text-xs font-semibold uppercase tracking-[0.22em]",
} as const

const buttonClass =
  "inline-flex items-center justify-center rounded-full border border-transparent bg-brun px-6 py-3 text-base font-semibold text-blanc-casse transition-all duration-200 hover:bg-brun-deep hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brun/40 focus-visible:ring-offset-2 focus-visible:ring-offset-blanc-casse"

function Container({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1512px] px-4 sm:px-8", className)}>
      {children}
    </div>
  )
}

function UluleButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href={siteConfig.ululeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonClass, className)}
    >
      {children}
    </a>
  )
}

function Hero() {
  return (
    <section className="bg-blanc-casse">
      <div className="grid overflow-hidden rounded-none md:grid-cols-2">
        <div className="relative min-h-[380px] bg-maya md:h-[724px] md:min-h-0">
          <Image
            src="/images/brand/image-hero-V1.webp"
            alt="Trois femmes sourient autour d'une table avec des souvenirs de vacances."
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="relative flex min-h-[520px] flex-col justify-center bg-blanc-casse px-6 py-10 md:h-[724px] md:min-h-0 md:px-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(94,47,43,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(94,47,43,0.08) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10 max-w-[625px]">
            <LogoAlbom className="mb-8 text-brun" height={48} />
            <h1 className={cn(T.display1, "text-brun")}>Une activité créative pour tes vacances</h1>
            <p className={cn(T.bodyLead, "mt-6 text-brun/90")}>
              Albom te propose un kit créatif qui contient un carnet à compléter, tes plus belles photos,
              des stickers et des feutres. L&apos;objet parfait à conserver précieusement ou à offrir à tes proches.
            </p>
            <UluleButton className="mt-10">Voir le pack</UluleButton>
          </div>
        </div>
      </div>
    </section>
  )
}

function ValuesStrip() {
  const values = ["Créativité", "Déconnexion", "Fait-main", "Souvenirs", "Dimanche cosy"]
  return (
    <section className="overflow-hidden bg-maya py-3 md:py-0">
      <div className="relative min-h-[70px] overflow-hidden">
        <div className="absolute left-0 top-1/2 flex min-w-full -translate-y-1/2 animate-[ribbon_18s_linear_infinite] items-center whitespace-nowrap text-brun">
          {Array.from({ length: 3 }).map((_, loopIdx) => (
            <span key={`loop-${loopIdx}`} className="inline-flex items-center">
              {values.map((value) => (
                <span key={`${loopIdx}-${value}`} className="inline-flex items-center">
                  <span className="font-display text-[34px] font-light leading-none tracking-[-0.04em]">
                    {value}
                  </span>
                  <span className="mx-7 size-1.5 rounded-full bg-brun opacity-100" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function PackSection() {
  const items = [
    "1 Albom au format magazine sur le thème de ton choix",
    "20 photos autocollantes de tes meilleurs souvenirs de vacances",
    "2 planches de stickers dans l'univers du magazine sélectionné",
    "2 feutres Stabilo aux couleurs de l'édition du magazine",
  ]

  return (
    <section className="bg-blanc-casse py-16 md:py-24">
      <Container>
        <h2 className={cn(T.display2, "text-center text-brun")}>Le contenu du pack Albom</h2>
        <p className={cn(T.bodyLead, "mx-auto mt-5 max-w-[716px] text-center text-brun/85")}>
          Notre pack contient l&apos;essentiel pour un moment créatif. Tu prépares une bonne boisson,
          tu poses ton téléphone et tu redonnes vie à tes souvenirs.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.15fr_1fr]">
          <ul className="space-y-6 text-brun">
            {items.slice(0, 2).map((item) => (
              <li key={item} className="rounded-2xl border border-brun/15 bg-beurre p-5">
                <p className={cn(T.body, "text-brun")}>{item}</p>
              </li>
            ))}
          </ul>

          <div className="relative min-h-[520px] rounded-2xl bg-beurre p-4">
            <Image
              src="/images/benefits/benefits-V1-01.webp"
              alt="Éléments du kit Albom posés sur une table."
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="rounded-2xl object-cover"
            />
          </div>

          <ul className="space-y-6 text-brun">
            {items.slice(2).map((item) => (
              <li key={item} className="rounded-2xl border border-brun/15 bg-beurre p-5">
                <p className={cn(T.body, "text-brun")}>{item}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 text-center">
          <UluleButton>Soutenir sur Ulule</UluleButton>
        </div>
      </Container>
    </section>
  )
}

function DeliveryIcon() {
  return <img src="/icons/reassurance-delivery.svg" width={48} height={48} alt="" />
}

function LockIcon() {
  return <img src="/icons/reassurance-lock.svg" width={48} height={48} alt="" />
}

function ShippingIcon() {
  return <img src="/icons/reassurance-shipping.svg" width={48} height={48} alt="" />
}

function Reassurance() {
  const cards = [
    {
      title: "Livraison offerte",
      desc: "Dès 50€ de contribution, la livraison est offerte en France métropolitaine.",
      icon: <DeliveryIcon />,
    },
    {
      title: "Paiement sécurisé",
      desc: "Transactions protégées via Ulule, avec confirmation immédiate de ta contribution.",
      icon: <LockIcon />,
    },
    {
      title: "Livraison en 7 jours",
      desc: "Quand l'édition est prête, ton colis est expédié rapidement avec suivi.",
      icon: <ShippingIcon />,
    },
  ]
  return (
    <section className="rounded-[16px] bg-maya py-10 md:py-12">
      <Container className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl px-6 py-7 text-center text-brun">
            <div className="mx-auto mb-5 inline-flex size-24 items-center justify-center rounded-full bg-beurre">
              <span className="inline-flex size-12 items-center justify-center text-brun">
                {card.icon}
              </span>
            </div>
            <h3 className="font-display text-[40px] font-bold leading-none tracking-[-0.04em]">
              {card.title}
            </h3>
            <p className={cn(T.body, "mt-3 text-brun/80")}>{card.desc}</p>
          </article>
        ))}
      </Container>
    </section>
  )
}

function Steps() {
  const steps = [
    {
      image: "/images/steps/steps-images-V1-01.webp",
      title: "Commander",
      desc: "Passe ta commande en sélectionnant tes plus belles photos souvenirs.",
    },
    {
      image: "/images/steps/steps-images-V1-02.webp",
      title: "Personnaliser",
      desc: "Prends du temps pour toi et crée ton album souvenirs à ta façon.",
    },
    {
      image: "/images/steps/steps-images-V1-03.webp",
      title: "Partager",
      desc: "Conserve et redécouvre tes souvenirs avec tes proches au fil du temps.",
    },
  ]

  return (
    <section className="bg-blanc-casse py-16 md:py-24">
      <Container>
        <h2 className={cn(T.display2, "text-center text-brun")}>Comment ça marche ?</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, idx) => (
            <article key={step.title} className="group rounded-xl bg-white p-4 text-brun shadow-sm transition-shadow duration-200 hover:shadow-[0_12px_24px_rgba(73,41,41,0.14)]">
              <div className="relative aspect-[440/290] overflow-hidden rounded-lg">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute right-3 top-3 inline-flex size-[44px] items-center justify-center rounded-full bg-brun text-lg font-semibold text-beurre">
                  {idx + 1}
                </span>
              </div>
              <h3 className="mt-4 font-display text-[40px] font-bold leading-none tracking-[-0.04em]">
                {step.title}
              </h3>
              <p className={cn(T.body, "mt-2 text-brun/85")}>{step.desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center">
          <UluleButton>Personnaliser</UluleButton>
        </div>
      </Container>
    </section>
  )
}

function SocialProof() {
  const cards = [
    "/images/socialproofs/socialproof-video-V1-01.webp",
    "/images/socialproofs/socialproof-video-V1-02.webp",
    "/images/socialproofs/socialproof-video-V1-03.webp",
    "/images/socialproofs/socialproof-video-V1-04.webp",
  ]
  return (
    <section className="bg-brun py-16 text-beurre md:py-24">
      <Container>
        <h2 className={cn(T.display2, "text-center text-beurre")}>Ils en parlent mieux que nous</h2>
        <p className={cn(T.body, "mx-auto mt-4 max-w-[720px] text-center text-beurre/85")}>
          Leurs premiers retours sentent déjà les vacances, le papier et le dimanche cosy.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {cards.map((card, idx) => (
            <article key={card} className="group relative h-[480px] overflow-hidden rounded-lg bg-blanc-casse md:h-[626px]">
              <Image
                src={card}
                alt={`Retour client ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </article>
          ))}
        </div>
        <div className="mt-12 text-center">
          <UluleButton className="bg-maya text-brun hover:bg-maya-deep">Je commande mon Albom</UluleButton>
        </div>
      </Container>
    </section>
  )
}

function Benefits() {
  const benefits = [
    {
      title: "Déconnexion",
      desc: "Quelques heures sans scroller pour te reconnecter à tes souvenirs sans ton téléphone.",
    },
    {
      title: "Un objet unique",
      desc: "Pas un album sorti d'une usine. Un objet fait de tes mains qui te ressemble.",
    },
    {
      title: "Activité créative",
      desc: "Le scrapbooking t'attire mais c'est trop de matos ? Albom te simplifie tout.",
    },
    {
      title: "Souvenirs valorisés",
      desc: "Tu as des milliers de photos et pourtant aucun souvenir tangible entre les mains.",
    },
  ]
  return (
    <section className="bg-beurre py-16 md:py-24">
      <Container className="grid gap-6 lg:grid-cols-2">
        <div className="relative min-h-[420px] overflow-hidden rounded-xl md:min-h-[596px]">
          <Image
            src="/images/benefits/benefits-V1-01.webp"
            alt="Kit Albom en cours de personnalisation sur une table."
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="rounded-xl p-2 text-brun md:p-0">
          <h2 className={cn(T.display3, "bg-brun px-4 py-2 text-beurre")}>Pourquoi tu vas l'adorer</h2>
          <div className="mt-5">
            <BenefitsCarousel items={benefits} />
          </div>
        </div>
      </Container>
    </section>
  )
}

function Founder() {
  return (
    <section className="bg-blanc-casse py-16 md:py-24">
      <Container className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <h2 className={cn(T.display2, "text-brun")}>
            J'ai créé Albom pour proposer une nouvelle façon de conserver ses souvenirs.
          </h2>
          <p className={cn(T.bodyLead, "mt-5 max-w-[560px] text-brun/90")}>
            Créer un Albom, c'est faire une activité créative pour transformer tes photos en souvenir unique :
            sans écran, sans complexité, juste toi, tes mains et tes meilleurs moments.
          </p>
          <UluleButton className="mt-8 w-fit">Personnaliser mon Albom</UluleButton>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-maya p-6 md:min-h-[724px]">
          <div className="relative mx-auto h-[520px] max-w-[420px] overflow-hidden border-[14px] border-blanc-casse">
            <Image
              src="/images/socialproofs/cha-portrait-V1.webp"
              alt="Portrait de Charlotte, fondatrice d'Albom."
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <p className="absolute right-7 top-7 max-w-[220px] bg-blanc-casse px-3 py-2 font-display text-[30px] leading-none text-brun shadow-sm">
            Je suis super contente de partager ce site avec vous
          </p>
          <p className="absolute bottom-8 left-8 font-display text-[42px] text-brun">Charlotte</p>
        </div>
      </Container>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-brun pt-14 text-beurre">
      <Container className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-normal text-beurre/50">À propos</p>
          <p className={cn(T.body, "max-w-[420px] text-beurre")}>
            Albom est un projet créatif français lancé avec amour. On imprime, on prépare et on expédie à la main.
          </p>
          <p className="mt-6 max-w-[420px] text-left font-display text-lg font-light leading-[1.35] text-beurre">
            © {new Date().getFullYear()} Albom — Tous droits réservés
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-beurre/50">Infos</p>
          <ul className="mt-4 space-y-2">
            <li><a href="#" className="text-beurre transition-colors hover:text-maya">Mentions légales</a></li>
            <li><a href="#" className="text-beurre transition-colors hover:text-maya">Politique de confidentialité</a></li>
            <li><a href="mailto:hello@albom.fr" className="text-beurre transition-colors hover:text-maya">Contactez-moi</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-beurre/50">Contact</p>
          <ul className="mt-4 space-y-2">
            <li>
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-beurre transition-colors hover:text-maya"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <g clipPath="url(#clip0_instagram_footer)">
                    <path d="M8.00191 3.98074C5.77715 3.98074 3.98265 5.77524 3.98265 7.99999C3.98265 10.2248 5.77715 12.0193 8.00191 12.0193C10.2267 12.0193 12.0212 10.2248 12.0212 7.99999C12.0212 5.77524 10.2267 3.98074 8.00191 3.98074ZM8.00191 10.613C6.56421 10.613 5.38886 9.44119 5.38886 7.99999C5.38886 6.5588 6.56071 5.38695 8.00191 5.38695C9.4431 5.38695 10.6149 6.5588 10.6149 7.99999C10.6149 9.44119 9.4396 10.613 8.00191 10.613ZM13.123 3.81633C13.123 4.33754 12.7033 4.7538 12.1856 4.7538C11.6644 4.7538 11.2481 4.33404 11.2481 3.81633C11.2481 3.29862 11.6679 2.87885 12.1856 2.87885C12.7033 2.87885 13.123 3.29862 13.123 3.81633ZM15.7851 4.7678C15.7256 3.512 15.4388 2.39962 14.5188 1.48313C13.6023 0.56664 12.4899 0.2798 11.2341 0.216836C9.93982 0.143379 6.06049 0.143379 4.76621 0.216836C3.51391 0.276304 2.40153 0.563143 1.48154 1.47963C0.561553 2.39612 0.278213 3.5085 0.215249 4.7643C0.141792 6.05858 0.141792 9.93791 0.215249 11.2322C0.274717 12.488 0.561556 13.6004 1.48154 14.5169C2.40153 15.4333 3.51041 15.7202 4.76621 15.7832C6.06049 15.8566 9.93982 15.8566 11.2341 15.7832C12.4899 15.7237 13.6023 15.4368 14.5188 14.5169C15.4353 13.6004 15.7221 12.488 15.7851 11.2322C15.8585 9.93791 15.8585 6.06208 15.7851 4.7678ZM14.113 12.6209C13.8401 13.3065 13.3119 13.8347 12.6228 14.1111C11.5909 14.5204 9.14227 14.4259 8.00191 14.4259C6.86155 14.4259 4.40941 14.5169 3.38098 14.1111C2.69537 13.8382 2.16716 13.31 1.89081 12.6209C1.48154 11.589 1.57599 9.14036 1.57599 7.99999C1.57599 6.85963 1.48504 4.4075 1.89081 3.37907C2.16366 2.69345 2.69187 2.16525 3.38098 1.8889C4.41291 1.47963 6.86154 1.57408 8.00191 1.57408C9.14227 1.57408 11.5944 1.48313 12.6228 1.8889C13.3084 2.16175 13.8366 2.68996 14.113 3.37907C14.5223 4.411 14.4278 6.85963 14.4278 7.99999C14.4278 9.14036 14.5223 11.5925 14.113 12.6209Z" fill="currentColor" />
                  </g>
                  <defs>
                    <clipPath id="clip0_instagram_footer">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                Instagram
              </a>
            </li>
            <li>
              <a
                href={siteConfig.links.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-beurre transition-colors hover:text-maya"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M14.8599 6.59006C13.5113 6.59329 12.1958 6.17271 11.0992 5.38774V10.8624C11.0978 14.6954 6.9475 17.0895 3.62868 15.1718C0.309866 13.254 0.311624 8.46273 3.63185 6.54742C4.59088 5.9942 5.70694 5.77638 6.80362 5.92841V8.68194C5.1251 8.15397 3.50448 9.64104 3.8865 11.3587C4.26852 13.0763 6.36667 13.7363 7.66317 12.5466C8.13498 12.1137 8.40356 11.5027 8.40354 10.8624V0.160034H11.0992C11.0973 0.387673 11.1164 0.615006 11.1562 0.839152C11.3455 1.85042 11.9427 2.73917 12.8076 3.29648C13.4163 3.69902 14.1301 3.91357 14.8599 3.91341V6.59006Z" fill="currentColor" />
                </svg>
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </Container>
      <div className="mt-10 px-3 pt-6 sm:px-8">
        <svg
          width="1522"
          height="470"
          viewBox="0 0 1522 470"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-full"
          role="img"
          aria-label="albom en grand format coupé"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M281.099 185.579C311.929 185.579 313.742 218.56 311.929 248.069C307.76 321.479 295.925 396.354 280.656 470H222.806C223.182 467.327 223.582 464.784 223.973 462.444L234.854 399.086C237.574 384.332 234.853 378.256 222.159 376.52C216.718 376.52 202.209 386.935 196.769 392.142L144.177 444.218C132.241 455.642 119.711 464.506 106.077 470H43.751C14.1621 456.066 8.38215e-05 421.241 0 386.936C0 307.088 93.3978 189.919 180.448 189.919C198.583 189.919 215.811 195.994 233.04 208.145C237.574 211.616 243.015 213.353 246.642 212.485C252.989 211.617 256.616 208.145 262.057 201.202C267.497 192.523 273.845 185.579 281.099 185.579ZM181.354 249.805C160.498 249.805 140.549 261.088 131.482 268.899C90.6773 298.408 59.8471 353.086 59.8469 388.671C59.8469 401.69 61.6605 415.576 79.7959 415.576C117.88 415.576 190.421 320.975 209.464 293.201C222.159 275.843 220.345 268.031 216.718 263.692C206.743 254.145 193.142 249.805 181.354 249.805Z"
            fill="#F8F5CA"
          />
          <path
            d="M420.05 46.7133C428.21 38.0343 432.744 34.5622 441.812 38.9016C457.227 45.845 458.134 62.3361 454.507 78.8264C441.812 137.844 437.278 167.353 428.211 226.371C414.678 307.682 401.147 388.398 388.648 470H326.791C334.133 409.686 345.806 355.782 357.482 301.879C371.083 232.447 379.245 193.391 394.66 124.826C400.1 97.0524 400.101 69.2791 420.05 46.7133Z"
            fill="#F8F5CA"
          />
          <path
            d="M550.319 15.0818C554.853 3.79892 565.735 -1.40863 571.175 0.327172C582.056 2.93113 593.844 18.5532 590.217 31.5717L545.525 231.976C543.711 240.655 540.991 249.334 540.084 258.013C540.084 271.9 552.779 272.768 560.94 266.692C614.439 235.448 652.524 215.486 695.142 271.9C720.531 306.617 728.692 343.069 714.184 385.597C706.023 409.031 694.235 430.728 677.913 450.69C672.349 457.396 666.457 463.832 660.313 470H563.908C599.644 450.749 628.195 424.115 648.897 388.201C663.405 363.899 665.218 344.805 659.778 319.636C656.151 303.145 633.481 290.127 615.346 297.938C603.558 302.277 591.77 308.352 580.889 317.899C524.721 365.687 500.111 406.763 488.959 470H434.103C446.787 394.719 463.975 321.161 484.771 248.466C502 187.712 519.489 71.4961 550.319 15.0818Z"
            fill="#F8F5CA"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M869.984 209.724C888.119 200.177 905.348 194.101 926.204 194.969C947.966 195.837 965.195 203.649 976.983 225.346C980.61 232.289 987.863 240.969 994.211 252.252C1015.07 284.364 1022.32 319.949 1013.25 357.269C1002.65 402.351 977.938 441.351 947.868 470H752.999C742.695 451.497 736.688 428.616 736.688 402.401C736.688 354.666 770.239 258.327 869.984 209.724ZM935.271 250.516C858.195 247.913 794.722 345.118 794.722 412.815C794.722 444.06 817.391 457.948 851.848 455.344C913.508 448.401 960.66 365.081 960.661 307.799C960.661 289.573 956.126 251.384 935.271 250.516Z"
            fill="#F8F5CA"
          />
          <path
            d="M1083.77 196.863C1091.02 184.712 1100.09 183.843 1110.07 192.522C1117.32 200.334 1121.85 208.145 1120.95 219.428C1120.04 235.05 1116.41 250.673 1114.6 267.163C1112.79 298.408 1131.83 294.936 1145.43 280.182C1178.98 248.069 1211.62 215.089 1256.96 212.485C1274.19 212.485 1291.42 221.164 1305.02 243.729C1313.18 255.012 1314.09 284.522 1332.22 284.522C1338.57 284.522 1346.73 280.182 1353.08 275.842C1383.91 254.145 1403.86 231.579 1440.13 231.579C1490.91 231.579 1525.37 286.257 1521.74 340.068C1519.02 382.596 1508.14 423.388 1490.91 462.444C1489.8 465.179 1488.52 467.7 1487.08 470H1442.52C1442.19 466.431 1442.34 462.633 1442.85 458.973C1446.48 427.728 1452.82 418.18 1459.17 390.407C1465.52 364.37 1469.15 338.332 1464.61 312.295C1461.89 296.672 1443.76 287.125 1424.71 292.332C1352.17 310.559 1327.69 379.992 1300.49 426.859C1291.42 441.614 1285.98 457.237 1278.72 468.519C1278.44 469.019 1278.15 469.511 1277.86 470H1221.51C1221.54 469.796 1221.56 469.592 1221.6 469.387C1226.13 443.35 1232.48 417.312 1238.83 392.142C1245.17 367.841 1254.24 344.407 1259.68 319.238C1261.5 312.294 1269.66 278.446 1247.89 278.446C1215.25 278.447 1173.54 333.125 1158.12 353.955C1138.18 381.728 1122.76 411.237 1108.25 436.406C1102.13 446.658 1094.56 459.072 1085.94 470H1021.27C1021.25 469.797 1021.22 469.592 1021.2 469.387C1020.29 459.84 1021.2 448.557 1022.11 437.274C1031.18 381.727 1055.66 256.748 1083.77 196.863Z"
            fill="#F8F5CA"
          />
        </svg>
      </div>
    </footer>
  )
}

export default function LandingPage(): JSX.Element {
  return (
    <>
      <TopChrome />
      <main>
        <Hero />
        <ValuesStrip />
        <PackSection />
        <Reassurance />
        <Steps />
        <SocialProof />
        <Benefits />
        <Founder />
      </main>
      <Footer />
    </>
  )
}
