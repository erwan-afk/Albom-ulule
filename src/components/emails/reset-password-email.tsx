import { Text } from "@react-email/components"

import { absoluteUrl } from "@/lib/utils"

import {
  EmailButton,
  EmailFallbackLink,
  EmailLayout,
  emailStyles,
} from "@/components/emails/email-layout"

interface ResetPasswordEmailProps {
  email: string
  resetPasswordToken: string
}

export function ResetPasswordEmail({
  email,
  resetPasswordToken,
}: Readonly<ResetPasswordEmailProps>): JSX.Element {
  const resetUrl = absoluteUrl(
    `/signin/password-update?token=${resetPasswordToken}`
  )

  return (
    <EmailLayout
      preview="Réinitialise ton mot de passe Albom"
      heading="On change le mot de passe ?"
    >
      <Text style={emailStyles.paragraph}>Bonjour,</Text>
      <Text style={emailStyles.paragraph}>
        Une demande de nouveau mot de passe a été faite pour le compte associé
        à <strong>{email}</strong>.
      </Text>
      <Text style={emailStyles.paragraph}>
        Si c&apos;est toi, choisis-en un nouveau avec le bouton ci-dessous. Le
        lien expire dans 24 heures.
      </Text>
      <EmailButton href={resetUrl}>Choisir un mot de passe</EmailButton>
      <EmailFallbackLink href={resetUrl} />
      <Text style={emailStyles.muted}>
        Si tu n&apos;as rien demandé, ignore cet email, ton mot de passe actuel
        reste valable. Ne transmets ce message à personne.
      </Text>
    </EmailLayout>
  )
}
