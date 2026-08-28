import { cn } from "@/lib/utils"

const ANNOTATIONS = [
  {
    id: "magazine",
    title: "1 Albom",
    subtitle: "au format magazine sur le thème Bord de Mer",
    className: "lg:left-0 lg:top-[-2%] lg:max-w-[250px]",
    textClassName: "lg:translate-y-20",
    arrowClassName: "left-[72%] top-[70%] h-[85px] w-[125px]",
    width: 174,
    height: 119,
    viewBox: "0 0 174 119",
    path: "M2.37012 70.7698C0.112681 50.5016 0.220536 35.0508 13.5994 17.5469C41.9904 -19.5979 83.7496 13.0855 96.6612 53.0355C106.404 83.1792 132.084 113.434 165.369 96.8305C172.183 93.4314 144.597 81.5407 151.907 88.7591C157.862 94.6383 166.807 95.6798 169.087 97.9978C174.945 103.954 145.408 121.089 152.643 116.913C159.942 110.498 165.455 102.557 172.46 95.8369",
  },
  {
    id: "photos",
    title: "21 photos autocollantes",
    subtitle: "de tes meilleurs souvenirs de vacances",
    className: "lg:left-0 lg:bottom-[5%] lg:max-w-[270px]",
    textClassName: "lg:-translate-y-12",
    arrowClassName: "left-[70%] top-[18%] h-[40px] w-[287px]",
    width: 398,
    height: 55,
    viewBox: "0 0 398 55",
    path: "M1.27119 14.2922C124.668 124.989 125.174 -43.415 225.709 13.2988C314.329 63.2903 416.66 27.8775 391.947 19.3594C388.974 18.3344 382.706 18.8805 377.644 19.1424C368.81 19.5994 392.058 19.462 394.782 20.4699C399.819 22.3334 389.572 44.6587 388.537 49.9807",
  },
  {
    id: "stickers",
    title: "1 planches de stickers",
    subtitle: "dans l'univers collection Bord de Mer",
    className: "lg:right-0 lg:top-[2%] lg:max-w-[250px] lg:text-right",
    textClassName: "lg:translate-y-20",
    arrowClassName: "right-[70%] top-[72%] h-[92px] w-[190px] -translate-x-16",
    width: 264,
    height: 128,
    viewBox: "0 0 264 128",
    path: "M262.228 56.5873C243.646 12.6364 211.418 -13.8908 166.831 10.6438C134.275 28.5576 137.562 75.9776 105.275 110.477C81.4202 135.967 50.4758 125.455 19.9128 117.216C9.5194 114.415 4.11833 108.957 2.54184 109.261C-2.13524 110.164 7.48412 120.779 9.02519 125.229C10.9337 130.741 5.85353 115 3.42323 110.987C3.31223 110.803 20.994 106.304 24.3536 103.952",
  },
  {
    id: "markers",
    title: "2 feutres Stabilo",
    subtitle: "aux couleurs de l'édition d'Albom",
    className: "lg:right-0 lg:bottom-[6%] lg:max-w-[240px] lg:text-right",
    textClassName: "",
    arrowClassName: "right-[72%] bottom-[78%] h-[188px] w-[131px]",
    width: 181,
    height: 262,
    viewBox: "0 0 181 262",
    path: "M179.137 259.902C179.137 259.902 183.121 172.927 162.822 127.477C140.927 78.4525 79.1277 95.8499 104.651 112.78C114.797 119.51 122.86 102.098 124.993 97.3475C140.284 63.2989 89.4047 22.1452 61.6034 13.7937C37.5229 6.55999 19.7715 10.8799 4.76647 11.5699C-0.732158 11.8228 13.0486 3.38654 14.0991 1.94076C16.5123 -1.38031 6.8132 8.42175 2.91537 13.7935C-2.08434 20.6838 16.4903 22.1235 19.5919 25.1091C14.0755 20.7276 7.6949 16.4428 1.26854 13.4606",
  },
] as const

export function PackDiagram() {
  return (
    <figure className="relative mt-12 w-full overflow-visible lg:min-h-[680px]">
      <div className="relative mx-auto w-full max-w-[520px] bg-blanc-casse lg:max-w-[720px] lg:py-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/pack/pack-kit-bord-de-mer.webp"
          alt="Le kit Albom : magazine Bord de mer, planche de photos, stickers et feutres Stabilo."
          width={1024}
          height={810}
          decoding="async"
          className="h-auto w-full bg-blanc-casse"
        />
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:absolute lg:inset-0 lg:mt-0 lg:block lg:gap-0">
        {ANNOTATIONS.map((item) => (
          <li
            key={item.id}
            className={cn("relative text-brun lg:absolute lg:z-10", item.className)}
          >
            <div className={item.textClassName}>
              <p className="font-display text-[clamp(24px,2.1vw,30px)] font-bold leading-[1.02] tracking-[-0.04em]">
                {item.title}
              </p>
              <p className="mt-1 text-base font-medium leading-[1.35] text-brun/85">
                {item.subtitle}
              </p>
            </div>
            <svg
              aria-hidden
              width={item.width}
              height={item.height}
              viewBox={item.viewBox}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={cn(
                "pointer-events-none absolute hidden overflow-visible text-brun lg:block",
                item.arrowClassName
              )}
            >
              <path
                d={item.path}
                stroke="currentColor"
                strokeWidth="2.53968"
                strokeLinecap="round"
              />
            </svg>
          </li>
        ))}
      </ul>
    </figure>
  )
}
