import { getUserByEmail } from "@/actions/user"
import bcryptjs from "bcryptjs"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import ResendProvider from "next-auth/providers/resend"

import { env } from "@/env.mjs"
import { resend, resendFrom } from "@/config/email"
import { signInWithPasswordSchema } from "@/validations/auth"

import { MagicLinkEmail } from "@/components/emails/magic-link-email"

const oauthProviders = []

if (env.GOOGLE_ID && env.GOOGLE_SECRET) {
  oauthProviders.push(
    GoogleProvider({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

if (env.GITHUB_ID && env.GITHUB_SECRET) {
  oauthProviders.push(
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

export default {
  providers: [
    ...oauthProviders,
    CredentialsProvider({
      async authorize(rawCredentials) {
        const validatedCredentials =
          signInWithPasswordSchema.safeParse(rawCredentials)

        if (validatedCredentials.success) {
          const user = await getUserByEmail({
            email: validatedCredentials.data.email,
          })
          if (!user || !user.passwordHash) return null

          const passwordIsValid = await bcryptjs.compare(
            validatedCredentials.data.password,
            user.passwordHash
          )

          if (passwordIsValid) return user
        }
        return null
      },
    }),
    ResendProvider({
      server: {
        host: env.RESEND_HOST,
        port: Number(env.RESEND_PORT),
        auth: {
          user: env.RESEND_USERNAME,
          pass: env.RESEND_API_KEY,
        },
      },
      async sendVerificationRequest({
        identifier,
        url,
      }: {
        identifier: string
        url: string
      }) {
        try {
          await resend.emails.send({
            from: resendFrom(),
            to: [identifier],
            subject: "Ton lien de connexion Albom",
            react: MagicLinkEmail({ identifier, url }),
          })

          console.log("Verification email sent")
        } catch (error) {
          throw new Error("Failed to send verification email")
        }
      },
    }),
  ],
} satisfies NextAuthConfig
