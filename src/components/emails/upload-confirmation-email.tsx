import { Text } from "@react-email/components"

import {
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

const PRODUCT_NAME = "Albom Bord de mer"

interface UploadConfirmationEmailProps {
  customerName: string
}

export function UploadConfirmationEmail({
  customerName,
}: Readonly<UploadConfirmationEmailProps>): JSX.Element {
  const greeting = customerName?.trim()
    ? `Bonjour ${customerName},`
    : "Bonjour,"

  return (
    <EmailLayout
      preview="Tes photos pour préparer ton Albom sont bien arrivées"
      heading="C'est reçu !"
      badge={PRODUCT_NAME}
    >
      <Text style={emailStyles.paragraph}>{greeting}</Text>
      <Text style={emailStyles.paragraph}>
        J&apos;ai bien reçu tes photos pour préparer ton Albom. Je m&apos;occupe
        de préparer ton kit créatif que tu recevras mi-novembre.
      </Text>
    </EmailLayout>
  )
}
