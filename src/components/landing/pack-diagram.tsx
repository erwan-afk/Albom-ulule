const PACK_ITEMS = [
  {
    id: "magazine",
    title: "1 Albom",
    subtitle: "au format magazine sur le thème Bord de Mer",
  },
  {
    id: "photos",
    title: "21 photos autocollantes",
    subtitle: "de tes meilleurs souvenirs de vacances",
  },
  {
    id: "stickers",
    title: "1 planches de stickers",
    subtitle: "dans l'univers collection Bord de Mer",
  },
  {
    id: "markers",
    title: "2 feutres Stabilo",
    subtitle: "aux couleurs de l'édition d'Albom",
  },
] as const

const PACK_ALT =
  "Le kit Albom Bord de mer : 1 magazine, 21 photos autocollantes, 1 planche de stickers et 2 feutres Stabilo."

export function PackDiagram() {
  return (
    <figure className="mt-12 w-full">
      <div className="relative mx-auto w-full max-w-[560px] bg-blanc-casse lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/pack/pack-kit-bord-de-mer-mobile.webp"
          alt={PACK_ALT}
          width={1337}
          height={1046}
          decoding="async"
          className="h-auto w-full bg-blanc-casse"
        />
      </div>

      <div className="relative hidden w-full bg-blanc-casse lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/pack/pack-kit-bord-de-mer-desktop.webp"
          alt=""
          width={2603}
          height={1394}
          decoding="async"
          className="h-auto w-full bg-blanc-casse"
        />
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-5 text-center sm:grid-cols-2 lg:sr-only">
        {PACK_ITEMS.map((item) => (
          <li key={item.id} className="text-brun">
            <p className="font-display text-[clamp(24px,2.1vw,30px)] font-bold leading-[1.02] tracking-[-0.04em]">
              {item.title}
            </p>
            <p className="mt-1 text-base font-medium leading-[1.35] text-brun/85">
              {item.subtitle}
            </p>
          </li>
        ))}
      </ul>
    </figure>
  )
}
