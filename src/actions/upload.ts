"use server"

import { writeFile, mkdir } from "fs/promises"
import path from "path"

import { prisma } from "@/config/db"
import {
  deleteByKey,
  sessionPhotoKey,
  uploadSessionPhoto,
} from "@/lib/r2/upload"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
  "application/pdf",
]
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 Mo

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
      error: `Fichier trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)} Mo). Taille maximale : 50 Mo.`,
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

  const file = await prisma.orderFile.findUnique({ where: { id: fileId } })
  if (!file) {
    return { success: false, error: "Fichier introuvable." }
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
