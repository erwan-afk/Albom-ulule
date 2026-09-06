import { Link, Text } from "@react-email/components"

import {
  EmailButton,
  EmailInfoBox,
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

interface NewEnquiryEmailProps {
  name: string
  email: string
  message: string
}

export function NewEnquiryEmail({
  name,
  email,
  message,
}: NewEnquiryEmailProps): JSX.Element {
  return (
    <EmailLayout
      preview={`Nouveau message de ${name}`}
      heading="Nouveau message depuis le site"
      badge="Contact"
    >
      <Text style={emailStyles.paragraph}>
        <strong>{name}</strong> t&apos;a écrit via le formulaire. Tu peux
        répondre directement à{" "}
        <Link
          href={`mailto:${email}`}
          style={{ color: "#673A36", textDecoration: "underline" }}
        >
          {email}
        </Link>
        .
      </Text>
      <EmailInfoBox>
        <Text style={{ ...emailStyles.muted, margin: "0 0 8px" }}>Message</Text>
        <Text style={{ ...emailStyles.paragraph, margin: 0, whiteSpace: "pre-wrap" }}>
          {message}
        </Text>
      </EmailInfoBox>
      <EmailButton href={`mailto:${email}`}>Répondre à {name}</EmailButton>
    </EmailLayout>
  )
}
