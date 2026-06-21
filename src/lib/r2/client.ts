import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import type { S3ClientConfig } from "@aws-sdk/client-s3"

let _client: S3Client | null = null

export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  )
}

export function getR2Client(): S3Client | null {
  if (!isR2Configured()) return null
  if (_client) return _client

  const config: S3ClientConfig = {
    region: process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
    // Compatibilité Cloudflare R2 + AWS SDK v3 récent
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  }

  _client = new S3Client(config)

  // GetObject : retirer x-amz-checksum-mode (non supporté par R2)
  _client.middlewareStack.add(
    (next) => async (args) => {
      const headers = (
        args.request as { headers?: Record<string, string> } | undefined
      )?.headers
      if (headers) {
        for (const key of Object.keys(headers)) {
          if (key.toLowerCase() === "x-amz-checksum-mode") {
            delete headers[key]
          }
        }
      }
      return next(args)
    },
    { step: "build", name: "r2StripChecksumMode" }
  )

  return _client
}

export function getBucketName(): string {
  return process.env.R2_BUCKET_NAME || "photos"
}

/** Test rapide de connectivité R2 (utile au diagnostic). */
export async function probeR2Connection(): Promise<{
  ok: boolean
  error?: string
}> {
  const r2 = getR2Client()
  if (!r2) return { ok: false, error: "R2 non configuré" }

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: getBucketName(),
        Key: ".healthcheck",
        Body: "ok",
        ContentType: "text/plain",
      })
    )
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
