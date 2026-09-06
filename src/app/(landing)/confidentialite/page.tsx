import type { Metadata } from "next"
import Link from "next/link"

import { LegalShell } from "@/components/landing/legal-shell"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment Albom collecte, utilise et protège tes données personnelles.",
  alternates: { canonical: `${siteConfig.url}/confidentialite` },
}

export default function ConfidentialitePage(): JSX.Element {
  return (
    <LegalShell title="Politique de confidentialité">
      <p>Dernière mise à jour : 6 septembre 2026.</p>
      <p>
        Albom collecte très peu de données, et seulement ce qui sert à faire
        tourner le site, répondre à tes messages, et préparer ton kit. Le
        responsable du traitement est Charlotte, fondatrice d&apos;Albom, joignable
        à{" "}
        <a href={siteConfig.links.contactEmail}>contact@albom.fr</a>.
      </p>

      <h2>Quand tu visites le site</h2>
      <p>
        Quelques données techniques transitent par notre hébergeur (adresse IP,
        type de navigateur, pages vues) pour faire fonctionner le site et en
        assurer la sécurité.
      </p>
      <p>
        On utilise aussi Vercel Analytics pour comprendre le trafic, de façon
        agrégée, sans cookies publicitaires et sans te suivre d&apos;un site à
        l&apos;autre.
      </p>

      <h2>Quand tu nous écris</h2>
      <p>
        Ton e-mail et le contenu de ton message, pour te répondre. Rien d&apos;autre.
      </p>

      <h2>Quand tu soutiens la campagne Ulule</h2>
      <p>
        Le paiement, l&apos;adresse de livraison et tes coordonnées sont collectés
        par Ulule. On reçoit ensuite ce qu&apos;il faut pour préparer et t&apos;envoyer
        ton kit (nom, e-mail, adresse). Ulule a sa propre{" "}
        <a
          href="https://fr.ulule.com/pages/about/privacy/"
          target="_blank"
          rel="noopener noreferrer"
        >
          politique de confidentialité
        </a>
        .
      </p>

      <h2>Quand tu envoies tes photos</h2>
      <p>
        Après ta commande, tu reçois un lien pour envoyer tes photos. Elles
        servent uniquement à imprimer ta planche d&apos;autocollants. On ne les
        publie pas, on ne les revend pas, et on les supprime une fois le kit
        fabriqué.
      </p>

      <h2>Combien de temps on les garde</h2>
      <ul>
        <li>Messages : le temps de te répondre, puis un an au plus.</li>
        <li>
          Données de commande : le temps de produire, livrer, et de respecter
          nos obligations comptables.
        </li>
        <li>Photos : le temps de fabriquer ton kit, puis suppression.</li>
        <li>Stats de visite : données agrégées, sans t&apos;identifier.</li>
      </ul>

      <h2>Avec qui on les partage</h2>
      <p>Uniquement les prestataires nécessaires pour faire le boulot :</p>
      <ul>
        <li>Vercel, pour héberger le site</li>
        <li>Ulule, pour la campagne et les paiements</li>
        <li>l&apos;outil d&apos;envoi d&apos;e-mails, pour t&apos;écrire</li>
        <li>le stockage des fichiers, le temps d&apos;imprimer tes photos</li>
      </ul>
      <p>Pas de revente. Pas de pub ciblée.</p>

      <h2>Tes droits</h2>
      <p>
        Tu peux demander à voir, corriger ou supprimer tes données, ou
        t&apos;opposer à leur utilisation. Écris à{" "}
        <a href={siteConfig.links.contactEmail}>contact@albom.fr</a>, on te
        répond.
      </p>
      <p>
        Tu peux aussi déposer une réclamation auprès de la{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          CNIL
        </a>
        .
      </p>

      <h2>Cookies</h2>
      <p>
        Le site public n&apos;utilise pas de cookies publicitaires. Pas de bandeau à
        cliquer pour visiter la page.
      </p>
      <p>
        Si tu accèdes à l&apos;espace privé (lien d&apos;envoi de photos), un cookie de
        session peut être déposé pour t&apos;identifier le temps de ta visite.
      </p>

      <h2>Réseaux sociaux</h2>
      <p>
        Les boutons Instagram et TikTok renvoient vers ces plateformes. Une
        fois là-bas, c&apos;est leur politique qui s&apos;applique.
      </p>

      <p>
        Voir aussi les{" "}
        <Link href="/mentions-legales">mentions légales</Link>.
      </p>
    </LegalShell>
  )
}
