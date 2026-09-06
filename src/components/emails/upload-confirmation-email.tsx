import { Text } from "@react-email/components"

import {
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

interface UploadConfirmationEmailProps {
  customerName: string
  productName: string
  fileCount: number
}

export function UploadConfirmationEmail({
  customerName,
  productName,
  fileCount,
}: Readonly<UploadConfirmationEmailProps>): JSX.Element {
  const greeting = customerName?.trim()
    ? `Bonjour ${customerName},`
    : "Bonjour,"
  const photoLabel =
    fileCount > 1 ? `${fileCount} photos` : `${fileCount} photo`

  return (
    <EmailLayout
      preview={`Tes ${photoLabel} pour ${productName} sont bien arrivées`}
      heading="C'est reçu !"
      badge={productName}
    >
      <Text style={emailStyles.paragraph}>{greeting}</Text>
      <Text style={emailStyles.paragraph}>
        On a bien reçu tes <strong>{photoLabel}</strong> pour{" "}
        <strong>{productName}</strong>. Charlotte s&apos;occupe de
        l&apos;impression : tu n&apos;as plus rien à faire de ton côté.
      </Text>
      <Text style={emailStyles.paragraph}>
        Tu recevras un message dès que le kit sera en route.
      </Text>
    </EmailLayout>
  )
}
