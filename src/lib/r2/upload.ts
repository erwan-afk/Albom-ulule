import { mkdir, readFile, unlink } from "fs/promises"
import path from "path"

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3"

import { getBucketName, getR2Client, isR2Configured } from "./client"
import {
  sessionPdfFilename,
  sessionPdfR2Key,
} from "@/lib/photo-session/names"

// ─── Local fallback directory ───

const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "uploads")

function localPath(key: string): string {
  return path.join(LOCAL_UPLOADS_DIR, key)
}

async function ensureLocalDir(dir: string): Promise<void> {
  try {
    await mkdir(dir, { recursive: true })
  } catch {
    // already exists
  }
}

// ─── Read object (R2 or local) ───

function localKeysForObject(key: string): string[] {
  const keys = [key]
  // sessions/{token}/{file} → uploads/{token}/{file}
  if (key.startsWith("sessions/")) {
    const parts = key.split("/")
    if (parts.length >= 3) {
      keys.push(`${parts[1]}/${parts.slice(2).join("/")}`)
    }
  }
  // legacy: {token}/{file} on disk
  if (!key.includes("/") || key.split("/").length === 2) {
    keys.push(key)
  }
  return keys
}

async function readLocalObject(key: string): Promise<Buffer | null> {
  for (const localKey of localKeysForObject(key)) {
    try {
      return await readFile(localPath(localKey))
    } catch {
      // try next candidate
    }
  }
  return null
}

async function readR2Object(key: string): Promise<Buffer | null> {
  const r2 = getR2Client()
  if (!r2) return null
  try {
    const res = await r2.send(
      new GetObjectCommand({
        Bucket: getBucketName(),
        Key: key,
      })
    )
    if (!res.Body) return null
    return Buffer.from(await res.Body.transformToByteArray())
  } catch (err) {
    console.warn(
      `[r2] readObject failed for ${key}: ${(err as Error).message}`
    )
    return null
  }
}

export async function readObject(key: string): Promise<Buffer | null> {
  // En prod (R2) : sessions/* = R2 prioritaire (évite un vieux fichier local sur le serveur)
  if (isR2Configured() && key.startsWith("sessions/")) {
    const fromR2 = await readR2Object(key)
    if (fromR2) return fromR2
    return readLocalObject(key)
  }

  // Dev sans R2 : local d'abord
  const local = await readLocalObject(key)
  if (local) return local

  return readR2Object(key)
}

// ─── Upload PDF (R2 or local) ───

export interface UploadResult {
  key: string
  url: string
}

export async function uploadPdf(
  buffer: Buffer,
  orderName: string,
  siteUrl?: string,
  sessionToken?: string
): Promise<UploadResult> {
  const sanitized = orderName.replace(/[^a-zA-Z0-9._-]/g, "_")
  const key = sessionToken
    ? sessionPdfR2Key(sessionToken)
    : `pdf/${sanitized}-${Date.now()}.pdf`

  // Copie locale par session (photos + PDF au même endroit)
  if (sessionToken) {
    try {
      const sessionDir = localPath(sessionToken)
      const pdfName = sessionPdfFilename(sessionToken)
      await ensureLocalDir(sessionDir)
      const { writeFile } = await import("fs/promises")
      await writeFile(path.join(sessionDir, pdfName), buffer)
      console.info(`[local] session PDF saved uploads/${sessionToken}/${pdfName}`)
    } catch (err) {
      console.warn(
        `[local] session PDF save failed: ${(err as Error).message}`
      )
    }
  }

  const r2 = getR2Client()
  if (r2) {
    try {
      await r2.send(
        new PutObjectCommand({
          Bucket: getBucketName(),
          Key: key,
          Body: buffer,
          ContentType: "application/pdf",
        })
      )

      const url = buildPdfServeUrl(key, siteUrl)

      return { key, url }
    } catch (err) {
      console.warn(
        `[r2] uploadPdf failed, using local: ${(err as Error).message}`
      )
    }
  }

  // Local fallback
  const fullPath = localPath(key)
  await ensureLocalDir(path.dirname(fullPath))
  const { writeFile } = await import("fs/promises")
  await writeFile(fullPath, buffer)

  const url = buildPdfServeUrl(key, siteUrl)

  return { key, url }
}

/** URL de lecture avec cache-bust (même clé R2 à chaque régénération). */
function buildPdfServeUrl(key: string, siteUrl?: string): string {
  const cacheBust = `v=${Date.now()}`
  if (siteUrl) return `${siteUrl}/api/pdf/${key}?${cacheBust}`
  const publicUrl = process.env.R2_PUBLIC_URL
  if (publicUrl) return `${publicUrl}/${key}?${cacheBust}`
  return `/api/pdf/${key}?${cacheBust}`
}

// ─── Move temp images to order (R2 or local) ───

export interface MoveResult {
  finalKeys: string[]
  finalUrls: string[]
}

export async function moveTempImagesToOrder(
  tempKeys: string[],
  orderName: string
): Promise<MoveResult> {
  const sanitized = orderName.replace(/[^a-zA-Z0-9._-]/g, "_")
  const finalKeys: string[] = []
  const finalUrls: string[] = []

  const r2 = getR2Client()
  const bucket = getBucketName()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || undefined

  for (const tempKey of tempKeys) {
    const filename = tempKey.split("/").pop() || tempKey
    const finalKey = `orders/${sanitized}/${filename}`

    if (r2) {
      try {
        const getRes = await r2.send(
          new GetObjectCommand({ Bucket: bucket, Key: tempKey })
        )
        if (getRes.Body) {
          const body = Buffer.from(await getRes.Body.transformToByteArray())
          await r2.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: finalKey,
              Body: body,
              ContentType: getRes.ContentType || "image/jpeg",
            })
          )
          await r2.send(
            new DeleteObjectCommand({ Bucket: bucket, Key: tempKey })
          )
          finalKeys.push(finalKey)
          const url = siteUrl
            ? `${siteUrl}/api/photo/${finalKey}`
            : `${process.env.R2_PUBLIC_URL || ""}/${finalKey}`
          finalUrls.push(url)
        }
      } catch (err) {
        console.warn(
          `[r2] moveTempImagesToOrder failed for ${tempKey}: ${(err as Error).message}`
        )
      }
      continue
    }

    // Local fallback
    try {
      const tempPath = localPath(tempKey)
      const finalPath = localPath(finalKey)
      await ensureLocalDir(path.dirname(finalPath))
      const buf = await readFile(tempPath)
      const { writeFile } = await import("fs/promises")
      await writeFile(finalPath, buf)
      try {
        await unlink(tempPath)
      } catch {
        /* ok */
      }
      finalKeys.push(finalKey)
      finalUrls.push(
        siteUrl ? `${siteUrl}/api/photo/${finalKey}` : `/api/photo/${finalKey}`
      )
    } catch (err) {
      console.warn(
        `[local] moveTempImagesToOrder failed for ${tempKey}: ${(err as Error).message}`
      )
    }
  }

  return { finalKeys, finalUrls }
}

// ─── Delete by key (R2 + local) ───

export async function deleteByKey(key: string): Promise<void> {
  const r2 = getR2Client()
  if (r2) {
    try {
      await r2.send(
        new DeleteObjectCommand({
          Bucket: getBucketName(),
          Key: key,
        })
      )
    } catch (err) {
      console.warn(
        `[r2] deleteByKey failed for ${key}: ${(err as Error).message}`
      )
    }
  }

  for (const localKey of localKeysForObject(key)) {
    try {
      await unlink(localPath(localKey))
    } catch {
      // already gone
    }
  }
}

async function deleteR2Prefix(prefix: string): Promise<number> {
  const r2 = getR2Client()
  if (!r2) return 0

  let deleted = 0
  let continuationToken: string | undefined

  try {
    do {
      const listRes = await r2.send(
        new ListObjectsV2Command({
          Bucket: getBucketName(),
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      )

      for (const obj of listRes.Contents ?? []) {
        if (!obj.Key) continue
        try {
          await r2.send(
            new DeleteObjectCommand({
              Bucket: getBucketName(),
              Key: obj.Key,
            })
          )
          deleted++
        } catch {
          /* best-effort */
        }
      }

      continuationToken = listRes.IsTruncated
        ? listRes.NextContinuationToken
        : undefined
    } while (continuationToken)
  } catch (err) {
    console.warn(
      `[r2] deleteR2Prefix failed for ${prefix}: ${(err as Error).message}`
    )
  }

  return deleted
}

async function deleteLocalDir(dir: string): Promise<boolean> {
  try {
    const { rm } = await import("fs/promises")
    await rm(dir, { recursive: true, force: true })
    return true
  } catch {
    return false
  }
}

/**
 * Supprime tous les fichiers d'une commande (photos, PDF) en local et sur R2.
 */
export async function deleteSessionStorage(sessionToken: string): Promise<{
  r2ObjectsDeleted: number
  localDirsRemoved: number
}> {
  const r2Prefix = `sessions/${sessionToken}/`
  const r2ObjectsDeleted = await deleteR2Prefix(r2Prefix)

  let localDirsRemoved = 0
  if (await deleteLocalDir(localPath(sessionToken))) localDirsRemoved++
  if (await deleteLocalDir(localPath(r2Prefix.replace(/\/$/, ""))))
    localDirsRemoved++

  await emergencyCleanup(`db-${sessionToken}`)

  console.info(
    `[storage] deleteSessionStorage ${sessionToken}: R2=${r2ObjectsDeleted} object(s), local dirs=${localDirsRemoved}`
  )

  return { r2ObjectsDeleted, localDirsRemoved }
}

// ─── Key from public URL ───

export function keyFromPublicUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // Path is like /api/photo/orders/sanitized/filename
    const parts = u.pathname.replace(/^\/api\/photo\//, "").split("/")
    return parts.join("/") || null
  } catch {
    return null
  }
}

// ─── List temp session IDs ───

export async function listTempSessionIds(): Promise<string[]> {
  const prefix = "temp/"

  const r2 = getR2Client()
  if (r2) {
    try {
      const listRes = await r2.send(
        new ListObjectsV2Command({
          Bucket: getBucketName(),
          Prefix: prefix,
          Delimiter: "/",
        })
      )
      return (
        listRes.CommonPrefixes?.map((p) =>
          (p.Prefix || "").replace(prefix, "").replace(/\/$/, "")
        ).filter(Boolean) ?? []
      )
    } catch {
      return []
    }
  }

  // Local fallback
  try {
    const { readdir } = await import("fs/promises")
    const tempDir = localPath("temp")
    const entries = await readdir(tempDir, { withFileTypes: true })
    return entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    return []
  }
}

// ─── Emergency cleanup of temp uploads ───

export async function emergencyCleanup(sessionId: string): Promise<number> {
  let deleted = 0
  const prefix = `temp/${sessionId}/`

  const r2 = getR2Client()
  if (r2) {
    try {
      const listRes = await r2.send(
        new ListObjectsV2Command({
          Bucket: getBucketName(),
          Prefix: prefix,
        })
      )
      if (listRes.Contents) {
        for (const obj of listRes.Contents) {
          if (obj.Key) {
            try {
              await r2.send(
                new DeleteObjectCommand({
                  Bucket: getBucketName(),
                  Key: obj.Key,
                })
              )
              deleted++
            } catch {
              /* best-effort */
            }
          }
        }
      }
    } catch {
      /* best-effort */
    }
    return deleted
  }

  // Local fallback
  try {
    const { readdir } = await import("fs/promises")
    const tempDir = localPath(prefix)
    const files = await readdir(tempDir)
    for (const file of files) {
      try {
        await unlink(path.join(tempDir, file))
        deleted++
      } catch {
        /* best-effort */
      }
    }
  } catch {
    /* best-effort */
  }
  return deleted
}

// ─── Session photo upload (one folder per order token) ───

export function sessionPhotoKey(sessionId: string, filename: string): string {
  return `sessions/${sessionId}/${filename}`
}

/** Pousse les fichiers locaux d'une session vers R2 (photos uploadées avant fix TLS). */
export async function syncLocalSessionToR2(sessionToken: string): Promise<void> {
  const r2 = getR2Client()
  if (!r2) return

  const dir = localPath(sessionToken)
  let entries: string[]
  try {
    const { readdir } = await import("fs/promises")
    entries = await readdir(dir)
  } catch {
    return
  }

  for (const name of entries) {
    if (name.endsWith("-albom.pdf")) continue

    const key = sessionPhotoKey(sessionToken, name)
    try {
      const buf = await readFile(path.join(dir, name))
      const contentType = name.toLowerCase().endsWith(".png")
        ? "image/png"
        : name.toLowerCase().endsWith(".webp")
          ? "image/webp"
          : "image/jpeg"

      await r2.send(
        new PutObjectCommand({
          Bucket: getBucketName(),
          Key: key,
          Body: buf,
          ContentType: contentType,
        })
      )
      console.info(`[r2] syncLocalSessionToR2 OK ${key}`)
    } catch (err) {
      console.warn(
        `[r2] syncLocalSessionToR2 failed for ${key}: ${(err as Error).message}`
      )
    }
  }
}

export async function uploadSessionPhoto(
  buffer: Buffer,
  sessionId: string,
  filename: string,
  contentType: string
): Promise<string | null> {
  const key = sessionPhotoKey(sessionId, filename)

  const r2 = getR2Client()
  if (!r2) return null

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    )
    console.info(`[r2] uploadSessionPhoto OK ${key}`)
    return key
  } catch (err) {
    console.warn(
      `[r2] uploadSessionPhoto failed for ${key}: ${(err as Error).message}`
    )
    return null
  }
}

// ─── Upload temp photo (used during upload phase) ───

export async function uploadTempPhoto(
  buffer: Buffer,
  sessionId: string,
  filename: string
): Promise<string> {
  const key = `temp/${sessionId}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`

  const r2 = getR2Client()
  if (r2) {
    await r2.send(
      new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
      })
    )
    return key
  }

  // Local fallback
  const fullPath = localPath(key)
  await ensureLocalDir(path.dirname(fullPath))
  const { writeFile } = await import("fs/promises")
  await writeFile(fullPath, buffer)
  return key
}
