import { Text } from "@react-email/components"

import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

interface MagicLinkEmailProps {
  identifier: string
  url: string
}

export function MagicLinkEmail({
  identifier,
  url,
}: MagicLinkEmailProps): JSX.Element {
  return (
    <EmailLayout
      preview="Ton lien de connexion Albom"
      heading="C'est bien toi ?"
    >
      <Text style={emailStyles.paragraph}>Bonjour,</Text>
      <Text style={emailStyles.paragraph}>
        Quelqu&apos;un a demandé un lien de connexion pour{" "}
        <strong>{identifier}</strong>. Si c&apos;est toi, clique sur le bouton
        ci-dessous, tu seras connecté·e tout de suite.
      </Text>
      <EmailButton href={url}>Se connecter</EmailButton>
      <EmailFallbackLink href={url} />
      <Text style={emailStyles.muted}>
        Si tu n&apos;es pas à l&apos;origine de cette demande, ignore cet email,
        ton compte reste inchangé.
      </Text>
    </EmailLayout>
  )
}
