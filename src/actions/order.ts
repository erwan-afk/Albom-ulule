"use server"

import { randomBytes } from "crypto"

import { revalidatePath } from "next/cache"
import {
  sendOrderLinkEmail,
  sendOrderReminderEmail,
  sendUploadConfirmationEmail,
} from "@/actions/email"

import { prisma } from "@/config/db"

export type CreateOrderInput = {
  customerEmail: string
  customerName?: string
  productName?: string
  productHandle?: string
  notes?: string
}

export async function createOrder(input: CreateOrderInput) {
  const { customerEmail, customerName, productName, productHandle, notes } =
    input

  const token = randomBytes(32).toString("hex")

  const order = await prisma.order.create({
    data: {
      customerEmail,
      customerName: customerName || null,
      productName: productName || null,
      productHandle: productHandle || null,
      notes: notes || null,
      token,
      status: "PENDING",
    },
  })

  revalidatePath("/dashboard")

  return {
    success: true,
    order: {
      id: order.id,
      token: order.token,
      customerEmail: order.customerEmail,
      status: order.status,
    },
  }
}

export async function sendOrderLink(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    return { success: false, error: "Commande introuvable." }
  }

  const handle = order.productHandle ?? "product"
  const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/upload/${handle}?token=${order.token}`

  const emailResult = await sendOrderLinkEmail({
    to: order.customerEmail,
    customerName: order.customerName || "Client",
    uploadUrl,
    productName: order.productName || "votre commande",
    orderId: order.id,
  })

  if (!emailResult.success) {
    return { success: false, error: "Echec de l'envoi de l'e-mail." }
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "LINK_SENT" },
  })

  revalidatePath("/dashboard")

  return { success: true, order }
}

export async function getOrderByToken(token: string) {
  const order = await prisma.order.findUnique({
    where: { token },
    include: { files: true },
  })

  if (!order) return null

  return {
    id: order.id,
    token: order.token,
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    productName: order.productName,
    status: order.status,
    notes: order.notes,
    files: order.files,
    createdAt: order.createdAt,
  }
}

export async function getOrders() {
  const orders = await prisma.order.findMany({
    include: { files: true },
    orderBy: { createdAt: "desc" },
  })

  return orders
}

export async function confirmUpload(token: string) {
  const order = await prisma.order.findUnique({
    where: { token },
    include: { files: true },
  })

  if (!order) {
    return { success: false, error: "Commande introuvable." }
  }

  if (order.files.length === 0) {
    return { success: false, error: "Aucune photo telechargee." }
  }

  await prisma.order.update({
    where: { token },
    data: { status: "PHOTOS_UPLOADED" },
  })

  const handle = order.productHandle ?? "product"
  const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/upload/${handle}?token=${token}`

  // Send confirmation email (non-blocking)
  sendUploadConfirmationEmail({
    to: order.customerEmail,
    customerName: order.customerName || "Client",
    uploadUrl,
    productName: order.productName || "votre commande",
    fileCount: order.files.length,
  }).catch((err) => {
    console.error(`[confirmUpload] Email failed: ${(err as Error).message}`)
  })

  revalidatePath("/dashboard")

  // Trigger PDF generation in background
  const filePaths = order.files.map((f) => `${token}/${f.storedName}`)

  const { processOrderFromDb } = await import(
    "@/lib/photo-session/processOrder"
  )

  // Fire-and-forget: don't block the HTTP response
  processOrderFromDb(
    token,
    order.productHandle || order.id,
    order.customerName || "Client",
    order.productName || "",
    filePaths,
    undefined,
    undefined
  ).then((result) => {
    if (!result.ok) {
      console.error(
        `[confirmUpload] PDF generation failed for ${token}: ${result.error}`
      )
    }
  })

  return { success: true }
}

export type UpdateOrderInput = {
  id: string
  customerEmail: string
  customerName?: string
  productName?: string
  productHandle?: string
  notes?: string
}

export async function updateOrder(input: UpdateOrderInput) {
  const { id, customerEmail, customerName, productName, productHandle, notes } =
    input

  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) {
    return { success: false, error: "Commande introuvable." }
  }

  await prisma.order.update({
    where: { id },
    data: {
      customerEmail,
      customerName: customerName || null,
      productName: productName || null,
      productHandle: productHandle || null,
      notes: notes || null,
    },
  })

  revalidatePath("/dashboard")

  return { success: true }
}

export async function deleteOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) {
    return { success: false, error: "Commande introuvable." }
  }

  await prisma.order.delete({ where: { id: orderId } })

  revalidatePath("/dashboard")

  return { success: true }
}

export async function resendOrderLink(orderId: string) {
  return sendOrderLink(orderId)
}

export async function sendReminderEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    return { success: false, error: "Commande introuvable." }
  }

  const handle = order.productHandle ?? "product"
  const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/upload/${handle}?token=${order.token}`

  const emailResult = await sendOrderReminderEmail({
    to: order.customerEmail,
    customerName: order.customerName || "Client",
    uploadUrl,
    productName: order.productName || "votre commande",
    orderId: order.id,
  })

  if (!emailResult.success) {
    return { success: false, error: "Echec de l'envoi de l'email de relance." }
  }

  revalidatePath("/dashboard")

  return { success: true }
}

export async function regeneratePdf(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { files: true },
  })

  if (!order) {
    return { success: false, error: "Commande introuvable." }
  }

  if (order.files.length === 0) {
    return { success: false, error: "Aucun fichier a inclure dans le PDF." }
  }

  // Les fichiers ont peut-etre deja ete deplaces dans orders/<handle>/
  // lors d'une premiere generation. On utilise ce chemin.
  const sanitized = (order.productHandle || order.id).replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  )
  const filePaths = order.files.map(
    (f) => `orders/${sanitized}/${f.storedName}`
  )

  const { processOrderFromDb } = await import(
    "@/lib/photo-session/processOrder"
  )

  // Declencher la generation en arriere-plan
  processOrderFromDb(
    order.token,
    order.productHandle || order.id,
    order.customerName || "Client",
    order.productName || "",
    filePaths,
    undefined,
    undefined
  ).then((result) => {
    if (!result.ok) {
      console.error(
        `[regeneratePdf] PDF generation failed for ${orderId}: ${result.error}`
      )
    } else {
      console.info(
        `[regeneratePdf] PDF regenerated for ${orderId}: ${result.pdfUrl}`
      )
    }
  })

  revalidatePath("/dashboard")

  return { success: true }
}
