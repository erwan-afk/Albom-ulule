import { S3Client } from "@aws-sdk/client-s3"

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

  _client = new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  })

  return _client
}

export function getBucketName(): string {
  return process.env.R2_BUCKET_NAME || "photos"
}
