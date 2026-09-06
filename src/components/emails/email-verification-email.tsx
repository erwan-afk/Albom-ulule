import { Text } from "@react-email/components"

import { env } from "@/env.mjs"

import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

interface EmailVerificationEmailProps {
  email: string
  emailVerificationToken: string
}

export function EmailVerificationEmail({
  email,
  emailVerificationToken,
}: Readonly<EmailVerificationEmailProps>): JSX.Element {
  const verifyUrl = `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/signup/verify-email?token=${emailVerificationToken}`

  return (
    <EmailLayout
      preview="Confirme ton adresse email pour Albom"
      heading="Encore une petite étape"
    >
      <Text style={emailStyles.paragraph}>Bonjour,</Text>
      <Text style={emailStyles.paragraph}>
        L&apos;adresse <strong>{email}</strong> a été utilisée pour créer un
        compte Albom. Confirme-la pour activer l&apos;accès.
      </Text>
      <EmailButton href={verifyUrl}>Confirmer mon email</EmailButton>
      <EmailFallbackLink href={verifyUrl} />
      <Text style={emailStyles.muted}>
        Si tu n&apos;as pas créé de compte, ignore et supprime ce message.
      </Text>
    </EmailLayout>
  )
}
