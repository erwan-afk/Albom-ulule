import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { ReactNode } from "react"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"

/** Couleurs de marque, en inline : les clients mail ignorent souvent Tailwind. */
export const emailColors = {
  brun: "#673A36",
  brunDeep: "#3E211E",
  maya: "#C0DFFF",
  beurre: "#F8F5CA",
  blancCasse: "#F9F9F4",
  muted: "#8B5E5A",
} as const

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"

export function emailAsset(path: string): string {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export const emailStyles = {
  paragraph: {
    margin: "0 0 16px",
    fontSize: "16px",
    lineHeight: "1.65",
    color: emailColors.brun,
    fontFamily,
  } as const,
  muted: {
    margin: "0 0 8px",
    fontSize: "13px",
    lineHeight: "1.55",
    color: emailColors.muted,
    fontFamily,
  } as const,
}

type EmailLayoutProps = {
  preview: string
  heading: string
  children: ReactNode
  badge?: string
}

export function EmailLayout({
  preview,
  heading,
  children,
  badge,
}: EmailLayoutProps): JSX.Element {
  return (
    <Html lang="fr">
      <Head>
        <title>{preview}</title>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: emailColors.blancCasse,
          fontFamily,
        }}
      >
        <Container
          style={{
            margin: "0 auto",
            padding: "32px 16px 48px",
            maxWidth: "600px",
          }}
        >
          <Section
            style={{
              backgroundColor: emailColors.brun,
              borderRadius: "16px 16px 0 0",
              padding: "20px 32px 16px",
              textAlign: "center",
            }}
          >
            <Link href={siteConfig.url} style={{ display: "inline-block" }}>
              <Img
                src={emailAsset("/images/email/albom-wordmark.png")}
                alt="albom"
                width={152}
                height={70}
                style={{
                  display: "block",
                  margin: "0 auto",
                  border: "0",
                  outline: "none",
                }}
              />
            </Link>
          </Section>

          <Section
            style={{
              backgroundColor: "#ffffff",
              padding: "36px 32px 8px",
              borderLeft: `1px solid ${emailColors.blancCasse}`,
              borderRight: `1px solid ${emailColors.blancCasse}`,
            }}
          >
            {badge ? (
              <Text
                style={{
                  display: "inline-block",
                  margin: "0 0 16px",
                  padding: "6px 12px",
                  backgroundColor: emailColors.maya,
                  color: emailColors.brun,
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  borderRadius: "999px",
                  fontFamily,
                }}
              >
                {badge}
              </Text>
            ) : null}

            <Heading
              as="h1"
              style={{
                margin: "0 0 20px",
                fontSize: "26px",
                lineHeight: "1.25",
                fontWeight: 600,
                color: emailColors.brun,
                fontFamily,
              }}
            >
              {heading}
            </Heading>

            {children}
          </Section>

          <Section
            style={{
              backgroundColor: emailColors.brun,
              borderRadius: "0 0 16px 16px",
              padding: "24px 32px 28px",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                margin: "0 0 8px",
                fontSize: "13px",
                lineHeight: "1.5",
                color: emailColors.beurre,
                fontFamily,
              }}
            >
              Une question ? Écris-nous à{" "}
              <Link
                href={siteConfig.links.contactEmail}
                style={{
                  color: emailColors.beurre,
                  textDecoration: "underline",
                }}
              >
                contact@albom.fr
              </Link>
            </Text>
            <Text
              style={{
                margin: 0,
                fontSize: "12px",
                color: emailColors.beurre,
                opacity: 0.75,
                fontFamily,
              }}
            >
              © {new Date().getFullYear()} Albom. Un kit créatif pour faire
              vivre tes plus beaux souvenirs.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

type EmailButtonProps = {
  href: string
  children: ReactNode
}

export function EmailButton({ href, children }: EmailButtonProps): JSX.Element {
  return (
    <Section style={{ textAlign: "center", margin: "28px 0 8px" }}>
      <Button
        href={href}
        target="_blank"
        style={{
          backgroundColor: emailColors.brun,
          color: emailColors.beurre,
          fontSize: "16px",
          fontWeight: 700,
          fontFamily,
          textDecoration: "none",
          textAlign: "center",
          lineHeight: "100%",
          padding: "16px 32px",
          borderRadius: "999px",
          display: "inline-block",
        }}
      >
        {children}
      </Button>
    </Section>
  )
}

export function EmailFallbackLink({ href }: { href: string }): JSX.Element {
  return (
    <Text style={{ ...emailStyles.muted, textAlign: "center", margin: "0 0 24px" }}>
      Le bouton ne s&apos;affiche pas ?{" "}
      <Link
        href={href}
        style={{ color: emailColors.brun, textDecoration: "underline" }}
      >
        Ouvre ce lien
      </Link>
    </Text>
  )
}

export function EmailInfoBox({ children }: { children: ReactNode }): JSX.Element {
  return (
    <Section
      style={{
        margin: "8px 0 24px",
        padding: "16px 20px",
        backgroundColor: emailColors.beurre,
        borderRadius: "12px",
      }}
    >
      {children}
    </Section>
  )
}
