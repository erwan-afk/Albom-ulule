"use server"

import { writeFile, mkdir } from "fs/promises"
import path from "path"

import type { OrderStatus } from "@prisma/client"

import { prisma } from "@/config/db"
import {
  deleteByKey,
  sessionPhotoKey,
  uploadSessionPhoto,
} from "@/lib/r2/upload"

const LOCKED_STATUSES: OrderStatus[] = [
  "PHOTOS_UPLOADED",
  "PRINTED",
  "PACKED",
  "SHIPPED",
  "CANCELLED",
]

const DEPOSIT_LOCKED_MESSAGE =
  "Ce dépôt est déjà confirmé et ne peut plus être modifié."

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
  "application/pdf",
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo

export async function uploadFile(formData: FormData) {
  const token = formData.get("token") as string
  const file = formData.get("file") as File | null

  if (!token || !file) {
    return { success: false, error: "Données manquantes." }
  }

  // Vérifier que la commande existe
  const order = await prisma.order.findUnique({ where: { token } })
  if (!order) {
    return { success: false, error: "Commande introuvable." }
  }

  if (LOCKED_STATUSES.includes(order.status)) {
    return { success: false, error: DEPOSIT_LOCKED_MESSAGE }
  }

  // Vérifier le type MIME
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Type de fichier non supporté : ${file.type}. Types acceptés : JPG, PNG, WebP, TIFF, PDF. (Les HEIC sont convertis en JPEG avant envoi.)`,
    }
  }

  // Vérifier la taille
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `Fichier trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)} Mo). Taille maximale : 10 Mo.`,
    }
  }

  const uploadDir = path.join(process.cwd(), "uploads", token)
  await mkdir(uploadDir, { recursive: true })

  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const storedName = `${timestamp}-${safeName}`
  const filePath = path.join(uploadDir, storedName)

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await writeFile(filePath, buffer)

  await uploadSessionPhoto(buffer, token, storedName, file.type)

  const savedFile = await prisma.orderFile.create({
    data: {
      orderId: order.id,
      originalName: file.name,
      storedName,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  })

  return {
    success: true,
    file: {
      id: savedFile.id,
      originalName: savedFile.originalName,
      sizeBytes: savedFile.sizeBytes,
    },
  }
}

export async function deleteUploadedFile(fileId: string, token: string) {
  const fs = await import("fs/promises")

  const file = await prisma.orderFile.findUnique({
    where: { id: fileId },
    include: { order: { select: { token: true, status: true } } },
  })
  if (!file || file.order.token !== token) {
    return { success: false, error: "Fichier introuvable." }
  }

  if (LOCKED_STATUSES.includes(file.order.status)) {
    return { success: false, error: DEPOSIT_LOCKED_MESSAGE }
  }

  const filePath = path.join(
    process.cwd(),
    "uploads",
    token,
    file.storedName
  )

  try {
    await fs.unlink(filePath)
  } catch {
    // Le fichier n'existe peut-être plus sur le disque, on continue
  }

  await deleteByKey(sessionPhotoKey(token, file.storedName))

  await prisma.orderFile.delete({ where: { id: fileId } })

  return { success: true }
}
