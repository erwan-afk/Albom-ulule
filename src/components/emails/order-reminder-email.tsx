import { Text } from "@react-email/components"

import {
  EmailButton,
  EmailFallbackLink,
  EmailInfoBox,
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

interface OrderReminderEmailProps {
  customerName: string
  uploadUrl: string
  productName: string
  orderId: string
}

export function OrderReminderEmail({
  customerName,
  uploadUrl,
  productName,
  orderId,
}: Readonly<OrderReminderEmailProps>): JSX.Element {
  const greeting = customerName?.trim()
    ? `Bonjour ${customerName},`
    : "Bonjour,"

  return (
    <EmailLayout
      preview={`Petit rappel : tes photos pour ${productName}`}
      heading="Tes photos n'ont pas encore été déposées"
      badge={productName}
    >
      <Text style={emailStyles.paragraph}>{greeting}</Text>
      <Text style={emailStyles.paragraph}>
        On n&apos;a pas encore reçu tes photos pour <strong>{productName}</strong>.
        Sans elles, Charlotte ne peut pas imprimer ta planche ni envoyer le kit.
      </Text>
      <Text style={emailStyles.paragraph}>
        Deux minutes, tes meilleurs clichés, et c&apos;est parti.
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
