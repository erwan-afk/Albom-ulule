import { Text } from "@react-email/components"

import { siteConfig } from "@/config/site"

import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

export function NewsletterWelcomeEmail(): JSX.Element {
  return (
    <EmailLayout
      preview="Bienvenue dans la bulle Albom"
      heading="Content·e de t'avoir ici"
    >
      <Text style={emailStyles.paragraph}>Bonjour,</Text>
      <Text style={emailStyles.paragraph}>
        Tu t&apos;es inscrit·e pour suivre Albom, l&apos;activité créative pour
        transformer tes photos en souvenir unique, sans écran, juste avec tes
        mains.
      </Text>
      <Text style={emailStyles.paragraph}>
        On t&apos;écrira de temps en temps : les nouvelles éditions, un
        dimanche d&apos;inspiration, rien de bruyant.
      </Text>
      <EmailButton href={siteConfig.ululeUrl}>
        Découvrir la campagne
      </EmailButton>
      <EmailFallbackLink href={siteConfig.ululeUrl} />
      <Text style={emailStyles.muted}>
        Une question ? Réponds à cet email ou écris à contact@albom.fr.
      </Text>
    </EmailLayout>
  )
}
