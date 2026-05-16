import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

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
  const previewText = `Rappel : deposez vos photos pour ${productName}`
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
                Nous n&apos;avons pas encore reçu vos photos pour votre
                commande de <strong>{productName}</strong>.
              </Text>
              <Text className="text-base">
                Pensez a les deposer des maintenant pour que nous puissions
                avancer sur votre commande :
              </Text>
              <Button href={uploadUrl}>
                Deposer mes photos
              </Button>
              <Text className="text-sm text-gray-500">
                Reference commande : {orderId}
              </Text>
            </Section>

            <Section>
              <Text className="text-sm">
                Formats acceptes : JPG, PNG, WebP, TIFF, PDF, HEIC.
              </Text>
              <Text className="text-sm">
                Taille maximale par fichier : 50 Mo.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
