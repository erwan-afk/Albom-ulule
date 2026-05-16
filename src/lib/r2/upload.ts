import { mkdir, readFile, unlink } from "fs/promises"
import path from "path"

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3"

import { getBucketName, getR2Client, isR2Configured } from "./client"

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

export async function readObject(key: string): Promise<Buffer | null> {
  const r2 = getR2Client()
  if (r2) {
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

  // Local fallback
  try {
    return await readFile(localPath(key))
  } catch {
    return null
  }
}

// ─── Upload PDF (R2 or local) ───

export interface UploadResult {
  key: string
  url: string
}

export async function uploadPdf(
  buffer: Buffer,
  orderName: string,
  siteUrl?: string
): Promise<UploadResult> {
  const sanitized = orderName.replace(/[^a-zA-Z0-9._-]/g, "_")
  const key = `pdf/${sanitized}-${Date.now()}.pdf`

  const r2 = getR2Client()
  if (r2) {
    await r2.send(
      new PutObjectCommand({
        Bucket: getBucketName(),
        Key: key,
        Body: buffer,
        ContentType: "application/pdf",
      })
    )

    const url = siteUrl
      ? `${siteUrl}/api/pdf/${key}`
      : `${process.env.R2_PUBLIC_URL || ""}/${key}`

    return { key, url }
  }

  // Local fallback
  const fullPath = localPath(key)
  await ensureLocalDir(path.dirname(fullPath))
  const { writeFile } = await import("fs/promises")
  await writeFile(fullPath, buffer)

  const url = siteUrl ? `${siteUrl}/api/pdf/${key}` : `/api/pdf/${key}`

  return { key, url }
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

// ─── Delete by key (R2 or local) ───

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
    return
  }

  // Local fallback
  try {
    await unlink(localPath(key))
  } catch {
    // already gone
  }
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
