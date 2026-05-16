import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

interface UploadConfirmationEmailProps {
  customerName: string
  uploadUrl: string
  productName: string
  fileCount: number
}

export function UploadConfirmationEmail({
  customerName,
  uploadUrl,
  productName,
  fileCount,
}: Readonly<UploadConfirmationEmailProps>): JSX.Element {
  const previewText = `Vos ${fileCount} photo(s) pour ${productName} ont bien été reçues`
  return (
    <Html lang="fr">
      <Head>
        <title>{previewText}</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body>
          <Container>
            <Section>
              <Text className="text-xl">Bonjour {customerName},</Text>
              <Text className="text-base">
                Nous avons bien reçu vos <strong>{fileCount} photo(s)</strong>{" "}
                pour votre commande <strong>{productName}</strong>.
              </Text>
              <Text className="text-base">
                Votre commande est maintenant en cours de traitement. Vous
                recevrez une notification dès qu&apos;elle sera expédiée.
              </Text>
            </Section>

            <Section>
              <Text className="text-sm text-gray-500">
                Si vous souhaitez modifier vos fichiers, vous pouvez toujours
                retourner sur votre espace de dépôt :{" "}
                <a href={uploadUrl} className="text-blue-600 underline">
                  {uploadUrl}
                </a>
              </Text>
            </Section>

            <Section>
              <Text className="text-base">
                Merci de votre confiance et à bientôt !
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
