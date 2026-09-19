import { Text } from "@react-email/components"

import {
  EmailButton,
  EmailFallbackLink,
  EmailInfoBox,
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

const PRODUCT_NAME = "Albom Bord de mer"

interface OrderReminderEmailProps {
  customerName: string
  uploadUrl: string
  orderId: string
}

export function OrderReminderEmail({
  customerName,
  uploadUrl,
  orderId,
}: Readonly<OrderReminderEmailProps>): JSX.Element {
  const greeting = customerName?.trim()
    ? `Bonjour ${customerName},`
    : "Bonjour,"

  return (
    <EmailLayout
      preview={`Petit rappel : tes photos pour ${PRODUCT_NAME}`}
      heading="Tes photos n'ont pas encore été déposées"
      badge={PRODUCT_NAME}
    >
      <Text style={emailStyles.paragraph}>{greeting}</Text>
      <Text style={emailStyles.paragraph}>
        J&apos;ai pas encore reçu tes photos pour l&apos;Albom Bord de mer.
        Sans elles, je ne peux pas imprimer tes photos et t&apos;envoyer ton
        kit créatif. Si tu as le moindre souci n&apos;hésite pas à
        m&apos;écrire.
      </Text>
      <EmailButton href={uploadUrl}>Déposer mes photos</EmailButton>
      <EmailFallbackLink href={uploadUrl} />
      <EmailInfoBox>
        <Text style={{ ...emailStyles.muted, margin: "0 0 6px" }}>
          Formats acceptés : JPG, PNG, WebP, TIFF, PDF, HEIC.
        </Text>
        <Text style={{ ...emailStyles.muted, margin: "0 0 6px" }}>
          Taille max : 10 Mo par fichier.
        </Text>
        <Text style={{ ...emailStyles.muted, margin: 0 }}>
          Référence commande : {orderId}
        </Text>
      </EmailInfoBox>
    </EmailLayout>
  )
}
