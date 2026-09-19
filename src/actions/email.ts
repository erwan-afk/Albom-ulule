"use server"

import crypto from "crypto"

import { getUserByEmail } from "@/actions/user"

import { env } from "@/env.mjs"
import { prisma } from "@/config/db"
import { EMAIL_PRODUCT_NAME, resend, resendFrom } from "@/config/email"
import {
  checkIfEmailVerifiedSchema,
  contactFormSchema,
  emailVerificationSchema,
  markEmailAsVerifiedSchema,
  type CheckIfEmailVerifiedInput,
  type ContactFormInput,
  type EmailVerificationFormInput,
  type MarkEmailAsVerifiedInput,
} from "@/validations/email"

import { EmailVerificationEmail } from "@/components/emails/email-verification-email"
import { NewEnquiryEmail } from "@/components/emails/new-enquiry-email"
import { OrderLinkEmail } from "@/components/emails/order-link-email"
import { OrderReminderEmail } from "@/components/emails/order-reminder-email"
import { OrderShippedEmail } from "@/components/emails/order-shipped-email"
import { UploadConfirmationEmail } from "@/components/emails/upload-confirmation-email"

type SendEmailResult = { success: true } | { success: false; error: string }

function formatResendError(message: string): string {
  const lower = message.toLowerCase()
  if (
    lower.includes("testing emails") ||
    lower.includes("only send testing") ||
    lower.includes("verify a domain")
  ) {
    return "Resend est en mode test (expéditeur @resend.dev) : les emails ne partent que vers l'adresse du compte Resend. Pour écrire aux clients, vérifie le domaine albom.fr dans Resend et mets-le dans RESEND_EMAIL_FROM."
  }
  return message
}

async function sendTransactionalEmail(options: {
  to: string | string[]
  subject: string
  react: JSX.Element
}): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: resendFrom(),
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      react: options.react,
    })

    if (error) {
      console.error("[email] Resend error:", error)
      return { success: false, error: formatResendError(error.message) }
    }

    if (!data?.id) {
      return {
        success: false,
        error: "Resend n'a pas confirmé l'envoi de l'email.",
      }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[email] send exception:", message)
    return { success: false, error: formatResendError(message) }
  }
}

export async function resendEmailVerificationLink(
  rawInput: EmailVerificationFormInput
): Promise<"invalid-input" | "not-found" | "error" | "success"> {
  try {
    const validatedInput = emailVerificationSchema.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const user = await getUserByEmail({ email: validatedInput.data.email })
    if (!user) return "not-found"

    const emailVerificationToken = crypto.randomBytes(32).toString("base64url")

    const userUpdated = await prisma.user.update({
      where: {
        email: validatedInput.data.email,
      },
      data: {
        emailVerificationToken,
      },
    })

    const emailSent = await sendTransactionalEmail({
      to: validatedInput.data.email,
      subject: "Confirme ton adresse email",
      react: EmailVerificationEmail({
        email: validatedInput.data.email,
        emailVerificationToken,
      }),
    })

    return userUpdated && emailSent.success ? "success" : "error"
  } catch (error) {
    console.error(error)
    throw new Error("Error resending email verification link")
  }
}

export async function checkIfEmailVerified(
  rawInput: CheckIfEmailVerifiedInput
): Promise<boolean> {
  try {
    const validatedInput = checkIfEmailVerifiedSchema.safeParse(rawInput)
    if (!validatedInput.success) return false

    const user = await getUserByEmail({ email: validatedInput.data.email })
    return user?.emailVerified instanceof Date ? true : false
  } catch (error) {
    console.error(error)
    throw new Error("Error checking if email verified")
  }
}

export async function markEmailAsVerified(
  rawInput: MarkEmailAsVerifiedInput
): Promise<"invalid-input" | "error" | "success"> {
  try {
    const validatedInput = markEmailAsVerifiedSchema.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const userUpdated = await prisma.user.update({
      where: {
        emailVerificationToken: validatedInput.data.token,
      },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
      },
    })

    return userUpdated ? "success" : "error"
  } catch (error) {
    console.error(error)
    throw new Error("Error marking email as verified")
  }
}

export async function submitContactForm(
  rawInput: ContactFormInput
): Promise<"error" | "success"> {
  try {
    const validatedInput = contactFormSchema.safeParse(rawInput)
    if (!validatedInput.success) return "error"

    const emailSent = await sendTransactionalEmail({
      to: env.RESEND_EMAIL_TO,
      subject: `Nouveau message de ${validatedInput.data.name}`,
      react: NewEnquiryEmail({
        name: validatedInput.data.name,
        email: validatedInput.data.email,
        message: validatedInput.data.message,
      }),
    })

    return emailSent.success ? "success" : "error"
  } catch (error) {
    console.error(error)
    throw new Error("Error submitting contact form")
  }
}

type SendOrderLinkEmailInput = {
  to: string
  customerName: string
  uploadUrl: string
  orderId: string
}

export async function sendOrderLinkEmail(
  input: SendOrderLinkEmailInput
): Promise<SendEmailResult> {
  return sendTransactionalEmail({
    to: input.to,
    subject: `Dépose tes photos pour ${EMAIL_PRODUCT_NAME}`,
    react: OrderLinkEmail({
      customerName: input.customerName,
      uploadUrl: input.uploadUrl,
      orderId: input.orderId,
    }),
  })
}

type SendOrderReminderEmailInput = {
  to: string
  customerName: string
  uploadUrl: string
  orderId: string
}

export async function sendOrderReminderEmail(
  input: SendOrderReminderEmailInput
): Promise<SendEmailResult> {
  return sendTransactionalEmail({
    to: input.to,
    subject: `Rappel : dépose tes photos pour ${EMAIL_PRODUCT_NAME}`,
    react: OrderReminderEmail({
      customerName: input.customerName,
      uploadUrl: input.uploadUrl,
      orderId: input.orderId,
    }),
  })
}

type SendUploadConfirmationEmailInput = {
  to: string
  customerName: string
}

export async function sendUploadConfirmationEmail(
  input: SendUploadConfirmationEmailInput
): Promise<SendEmailResult> {
  return sendTransactionalEmail({
    to: input.to,
    subject: `C'est reçu : tes photos pour ${EMAIL_PRODUCT_NAME}`,
    react: UploadConfirmationEmail({
      customerName: input.customerName,
    }),
  })
}

type SendOrderShippedEmailInput = {
  to: string
  customerName: string
  trackingUrl: string
}

export async function sendOrderShippedEmail(
  input: SendOrderShippedEmailInput
): Promise<SendEmailResult> {
  return sendTransactionalEmail({
    to: input.to,
    subject: `Ton kit ${EMAIL_PRODUCT_NAME} est en route`,
    react: OrderShippedEmail({
      customerName: input.customerName,
      trackingUrl: input.trackingUrl,
    }),
  })
}
