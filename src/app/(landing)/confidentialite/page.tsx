import type { Metadata } from "next"
import Link from "next/link"

import { ConsentControls } from "@/components/analytics/consent-controls"
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
      <p>Dernière mise à jour : 19 septembre 2026.</p>
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
        Pour mesurer l&apos;audience, on utilise un seul outil :{" "}
        <strong>PostHog</strong>, hébergé dans l&apos;Union européenne. Il nous
        dit quelles pages tu regardes, jusqu&apos;où tu descends dans la page et
        sur quels boutons tu cliques. Il ne sert pas à te faire de la pub.
      </p>
      <p>
        Tant que tu n&apos;as pas accepté les cookies, PostHog fonctionne sans
        cookie : rien n&apos;est stocké dans ton navigateur, et ton identifiant
        de visite est un code temporaire recalculé par leurs serveurs. On mesure
        des tendances, pas des personnes.
      </p>
      <p>
        Si tu acceptes, PostHog dépose un cookie pour reconnaître ton navigateur
        d&apos;une visite à l&apos;autre, et peut enregistrer le déroulé de ta
        navigation (les pages, les clics) pour qu&apos;on comprenne ce qui
        coince. Ce qui se passe sur la page d&apos;envoi de tes photos n&apos;est
        jamais enregistré, et ce que tu tapes dans un champ est masqué.
      </p>
      <p>
        PostHog a sa propre{" "}
        <a
          href="https://posthog.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          politique de confidentialité
        </a>
        .
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
        <li>
          Stats de visite : douze mois au plus, et sans jamais servir à
          t&apos;identifier.
        </li>
      </ul>

      <h2>Avec qui on les partage</h2>
      <p>Uniquement les prestataires nécessaires pour faire le boulot :</p>
      <ul>
        <li>notre hébergeur, pour faire tourner le site</li>
        <li>
          PostHog (serveurs dans l&apos;Union européenne), pour la mesure
          d&apos;audience
        </li>
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
        Pas de cookie publicitaire, jamais. Pas de revente, pas de reciblage.
      </p>
      <p>
        À ton premier passage, un petit bandeau te propose un choix. Si tu
        refuses, on continue de mesurer l&apos;audience sans cookie et le site
        marche exactement pareil. Si tu acceptes, PostHog dépose un cookie de
        mesure, conservé douze mois.
      </p>
      <p>Tu peux changer d&apos;avis quand tu veux, ici même :</p>
      <ConsentControls />
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
