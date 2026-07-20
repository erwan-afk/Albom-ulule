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
  const previewText = `Déposez vos photos pour ${productName}`
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
                Merci pour votre commande de <strong>{productName}</strong> !
              </Text>
              <Text className="text-base">
                Afin de personnaliser votre produit, merci de bien vouloir
                déposer vos photos via le lien ci-dessous :
              </Text>
              <Button href={uploadUrl}>
                Déposer mes photos
              </Button>
              <Text className="text-sm text-gray-500">
                Référence commande : {orderId}
              </Text>
            </Section>

            <Section>
              <Text className="text-sm">
                Formats acceptés : JPG, PNG, WebP, TIFF, PDF, HEIC.
              </Text>
              <Text className="text-sm">
                Taille maximale par fichier : 10 Mo.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
