import type { Metadata } from "next"
import Image from "next/image"

import { JsonLd } from "@/components/landing/json-ld"
import { TopChrome } from "@/components/landing/top-chrome"
import { LogoAlbom } from "@/components/landing/logo"
import { MarkerHighlight } from "@/components/landing/marker-highlight"
import { CraftSparkles, OrderAlbom, PackDetails, SupportCampaign, WhatIsAlbom } from "@/components/landing/icons"
import { PackDiagram } from "@/components/landing/pack-diagram"
import { UluleLink } from "@/components/landing/ulule-link"
import { siteConfig } from "@/config/site"
import { productJsonLd } from "@/lib/json-ld"
import { cn } from "@/lib/utils"

const pageTitle = `${siteConfig.name} — ${siteConfig.shortDescription}`

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: pageTitle,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
}

const T = {
  display1: "text-[clamp(40px,5.4vw,56px)] font-bold leading-[0.9] tracking-[-0.06em]",
  display2: "text-[clamp(32px,4vw,56px)] font-bold leading-[0.9] tracking-[-0.06em]",
  display3: "text-[clamp(28px,3vw,40px)] font-bold leading-[1.02] tracking-[-0.06em]",
  bodyLead: "text-[20px] leading-[1.3] font-medium",
  body: "text-base leading-[1.35] font-medium",
  caption: "text-xs font-semibold uppercase tracking-[0.22em]",
} as const

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-brun px-5 py-2.5 font-display text-[clamp(20px,2.2vw,28px)] font-bold leading-none tracking-[-0.04em] text-blanc-casse transition-all duration-200 hover:bg-brun-deep hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brun/40 focus-visible:ring-offset-2 focus-visible:ring-offset-blanc-casse"

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

function UluleButton({
  children,
  className,
  icon,
}: {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}) {
  return (
    <UluleLink className={cn(buttonClass, className)}>
      {children}
      {icon}
    </UluleLink>
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
        <div className="relative flex min-h-[520px] flex-col justify-end bg-blanc-casse px-6 pb-12 pt-28 md:h-[724px] md:min-h-0 md:px-16 md:pb-20 md:pt-0">
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
            <h1 className={cn(T.display1, "text-brun")}>
              <MarkerHighlight color="maya" className="-ml-[0.18em]">
                L&apos;activité créative
              </MarkerHighlight>
              <br />
              pour tes vacances
            </h1>
            <p className={cn(T.bodyLead, "mt-6 font-normal text-brun/90")}>
              <strong className="font-semibold">Albom te propose un kit créatif</strong> qui contient un carnet à compléter, tes plus belles photos,
              des stickers et des feutres. L&apos;objet parfait à conserver précieusement ou à offrir à tes proches.
            </p>
            <UluleButton className="mt-10" icon={<WhatIsAlbom size={24} className="shrink-0" />}>
              C&apos;est quoi un Albom ?
            </UluleButton>
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
  return (
    <section id="contenu" className="scroll-mt-20 bg-blanc-casse py-16 md:py-24">
      <Container>
        <h2 className={cn(T.display2, "text-center text-brun")}>
          <MarkerHighlight color="beurre">Le contenu du pack Albom</MarkerHighlight>
        </h2>
        <p className={cn(T.body, "mx-auto mt-5 max-w-[716px] text-center text-brun/85")}>
          Notre pack réunit tout{" "}
          <strong className="font-semibold">le nécessaire pour personnaliser ton album photo</strong>. Il ne te reste plus
          qu&apos;à choisir tes plus beaux souvenirs, préparer une boisson et profiter d&apos;un moment créatif rien
          qu&apos;à toi.
        </p>

        <PackDiagram />

        <div className="mt-12 text-center">
          <UluleButton icon={<PackDetails size={24} className="shrink-0" />}>
            Voir le pack en détails
          </UluleButton>
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
      image: "/images/steps/albom-step-01.webp",
      title: "Pré-commande ton Albom",
      desc: (
        <>
          Tu commandes sur Ulule et à la fin de la campagne, tu reçois un lien sécurisé{" "}
          <strong className="font-semibold">pour déposer tes 21 photos de vacances.</strong>
        </>
      ),
    },
    {
      image: "/images/steps/albom-step-02.webp",
      title: "Reçois ton kit créatif",
      desc: (
        <>
          Une fois tes photos envoyées, je prépare ton colis : Albom, stickers, photos imprimées et feutres.{" "}
          <strong className="font-semibold">La livraison est prévue en novembre.</strong>
        </>
      ),
    },
    {
      image: "/images/steps/albom-step-03.webp",
      title: "Crée un Albom qui te ressemble",
      desc: (
        <>
          Il ne te reste plus qu&apos;à t&apos;accorder{" "}
          <strong className="font-semibold">un moment créatif</strong> : une soirée tranquille, un
          dimanche après-midi pour créer ton Albom.
        </>
      ),
    },
  ]

  return (
    <section id="concept" className="scroll-mt-20 bg-blanc-casse py-16 md:py-24">
      <Container>
        <h2 className={cn(T.display2, "text-center text-brun")}>
          <MarkerHighlight color="beurre">Comment ça marche ?</MarkerHighlight>
        </h2>
        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.title} className="group rounded-xl bg-white p-4 text-brun shadow-sm transition-shadow duration-200 hover:shadow-[0_12px_24px_rgba(103,58,54,0.14)]">
              <div className="relative aspect-[440/290] overflow-hidden rounded-lg">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-4 font-display text-[clamp(28px,2.6vw,32px)] font-bold leading-none tracking-[-0.04em]">
                {step.title}
              </h3>
              <p className={cn(T.body, "mt-2 text-brun/85")}>{step.desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center">
          <UluleButton icon={<CraftSparkles size={24} className="shrink-0" />}>
            Personnaliser mon premier Albom
          </UluleButton>
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
    <section className="bg-beurre py-16 text-brun md:py-24">
      <Container>
        <h2 className={cn(T.display2, "text-center text-brun")}>
          Ils en parlent{" "}
          <MarkerHighlight color="maya">mieux que nous</MarkerHighlight>
        </h2>
        <p className={cn(T.body, "mx-auto mt-4 max-w-[720px] text-center text-brun/85")}>
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
          <UluleButton icon={<OrderAlbom size={24} className="shrink-0" />}>
            Je commande mon Albom
          </UluleButton>
        </div>
      </Container>
    </section>
  )
}

function Founder() {
  return (
    <section id="a-propos" className="scroll-mt-20 bg-blanc-casse">
      <div className="mx-auto grid w-full max-w-[1512px] lg:grid-cols-2">
        <div className="bg-maya lg:col-start-2">
          <Image
            src="/images/brand/charlotte-about-image.webp"
            alt="Charlotte, fondatrice d'Albom : « J'ai toujours adoré faire des activités créatives et collectionner mes souvenirs de voyages »."
            width={1134}
            height={1248}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-auto w-full"
          />
        </div>
        <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:col-start-1 lg:row-start-1 lg:px-12 lg:py-16 xl:px-16">
          <h2 className={cn(T.display3, "max-w-[28rem] font-display text-brun")}>
            « Moi, c&apos;est Charlotte, j&apos;ai créé Albom pour proposer une
            alternative aux albums photo impersonnels et au scrapbooking trop
            complexe. »
          </h2>
          <p className={cn(T.body, "mt-5 max-w-[560px] text-brun/85")}>
            Créer un Albom, c&apos;est faire une activité créative pour
            transformer tes photos en souvenir unique : sans écran, sans
            complexité, juste toi, tes mains et tes meilleurs moments.
          </p>
          <UluleButton
            className="mt-8 w-fit"
            icon={<SupportCampaign size={24} className="shrink-0" />}
          >
            Soutenir la campagne
          </UluleButton>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage(): JSX.Element {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...productJsonLd(),
        }}
      />
      <TopChrome />
      <main>
        <Hero />
        <ValuesStrip />
        <PackSection />
        <Reassurance />
        <Steps />
        <SocialProof />
        <Founder />
      </main>
    </>
  )
}
