import { Text } from "@react-email/components"

import {
  EmailButton,
  EmailFallbackLink,
  EmailInfoBox,
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

interface OrderLinkEmailProps {
  customerName: string
  uploadUrl: string
  productName: string
  orderId: string
}

export function OrderLinkEmail({
  customerName,
  uploadUrl,
  productName,
  orderId,
}: Readonly<OrderLinkEmailProps>): JSX.Element {
  const greeting = customerName?.trim()
    ? `Bonjour ${customerName},`
    : "Bonjour,"

  return (
    <EmailLayout
      preview={`Dépose tes photos pour ${productName}`}
      heading="Tes souvenirs t'attendent"
      badge={productName}
    >
      <Text style={emailStyles.paragraph}>{greeting}</Text>
      <Text style={emailStyles.paragraph}>
        Merci pour ta commande. Pour que Charlotte imprime tes photos en
        autocollants, dépose-les ici. Ça prend deux minutes, et après tu
        n&apos;as plus qu&apos;à attendre le kit.
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
