import { Text } from "@react-email/components"

import {
  EmailButton,
  EmailFallbackLink,
  EmailInfoBox,
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

const PRODUCT_NAME = "Albom Bord de mer"

interface OrderLinkEmailProps {
  customerName: string
  uploadUrl: string
  orderId: string
}

export function OrderLinkEmail({
  customerName,
  uploadUrl,
  orderId,
}: Readonly<OrderLinkEmailProps>): JSX.Element {
  const greeting = customerName?.trim()
    ? `Bonjour ${customerName},`
    : "Bonjour,"

  return (
    <EmailLayout
      preview={`Dépose tes photos pour ${PRODUCT_NAME}`}
      heading="Tes souvenirs t'attendent"
      badge={PRODUCT_NAME}
    >
      <Text style={emailStyles.paragraph}>{greeting}</Text>
      <Text style={emailStyles.paragraph}>
        Un grand merci pour ta commande ! Pour que je puisse préparer les
        photos de ton kit créatif, tu dois les déposer dans cet espace
        sécurisé. Après, tu n&apos;auras plus qu&apos;à attendre la
        réception de ton Albom !
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
