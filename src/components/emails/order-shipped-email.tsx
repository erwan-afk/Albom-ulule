import { Text } from "@react-email/components"

import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

const PRODUCT_NAME = "Albom Bord de mer"

interface OrderShippedEmailProps {
  customerName: string
  trackingUrl: string
}

export function OrderShippedEmail({
  customerName,
  trackingUrl,
}: Readonly<OrderShippedEmailProps>): JSX.Element {
  const greeting = customerName?.trim()
    ? `Bonjour ${customerName},`
    : "Bonjour,"

  return (
    <EmailLayout
      preview={`Ton kit ${PRODUCT_NAME} est en route`}
      heading="C'est parti !"
      badge={PRODUCT_NAME}
    >
      <Text style={emailStyles.paragraph}>{greeting}</Text>
      <Text style={emailStyles.paragraph}>
        Merci encore pour ton soutien. Ton kit créatif Albom vient
        d&apos;être expédié, il devrait arriver chez toi très bientôt. Tu
        peux suivre son parcours en cliquant sur le bouton juste en
        dessous !
      </Text>
      <EmailButton href={trackingUrl}>Suivre mon colis</EmailButton>
      <EmailFallbackLink href={trackingUrl} />
    </EmailLayout>
  )
}
