import type { Metadata } from "next"
import Link from "next/link"

import { LegalShell } from "@/components/landing/legal-shell"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Albom.",
  alternates: { canonical: `${siteConfig.url}/mentions-legales` },
}

export default function MentionsLegalesPage(): JSX.Element {
  return (
    <LegalShell title="Mentions légales">
      <p>Dernière mise à jour : 6 septembre 2026.</p>

      <h2>Éditeur du site</h2>
      <p>
        Le site{" "}
        <a href={siteConfig.url} target="_blank" rel="noopener noreferrer">
          albom.fr
        </a>{" "}
        est édité par Albom, un projet créatif français fondé par Charlotte.
      </p>
      <p>
        E-mail :{" "}
        <a href={siteConfig.links.contactEmail}>contact@albom.fr</a>
        <br />
        Directrice de la publication : Charlotte, fondatrice d&apos;Albom.
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA
        91723, États-Unis —{" "}
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
          vercel.com
        </a>
        .
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, visuels, illustrations, logotype et plus généralement tout le
        contenu du site sont protégés. Tu peux les consulter librement — pas les
        copier ni les réutiliser sans notre accord.
      </p>
      <p>
        Les photos que tu nous envoies pour composer ton kit restent les tiennes.
        On les utilise uniquement pour imprimer ta planche.
      </p>

      <h2>Commandes et paiements</h2>
      <p>
        Les précommandes et les paiements de la campagne se font sur Ulule, qui
        est seul responsable du traitement des paiements. Le site albom.fr ne
        collecte pas tes informations bancaires.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement de tes données est expliqué dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question :{" "}
        <a href={siteConfig.links.contactEmail}>contact@albom.fr</a>.
      </p>
    </LegalShell>
  )
}
