import fs from "node:fs";
import path from "node:path";
import {
  deleteByKey,
  emergencyCleanup,
  keyFromPublicUrl,
  listTempSessionIds,
} from "@/lib/r2/upload";
import { isR2Configured } from "@/lib/r2/client";
import {
  deletePendingSession,
  getPendingSession,
} from "@/lib/photo-session/pendingSessions";
import { getOrder } from "@/lib/photo-session/ordersLog";

const PHOTOS_DIR = path.join(process.cwd(), "public", "uploads", "photos");

// ─── Delete source photos by their URLs (legacy, kept for manual ops) ────────

export async function deletePhotosByUrls(urls: string[]): Promise<number> {
  let deleted = 0;

  if (isR2Configured()) {
    for (const url of urls) {
      try {
        const key = keyFromPublicUrl(url);
        if (key) {
          await deleteByKey(key);
          deleted++;
        }
      } catch (err) {
        console.warn(
          `[cleanup] Failed to delete R2 photo: ${url}`,
          (err as Error).message
        );
      }
    }
  } else {
    for (const url of urls) {
      try {
        const pathPart = url.replace(/^https?:\/\/[^/]+/, "");
        const rel = pathPart.replace(/^\/uploads\//, "");
        if (rel.includes("..") || rel.includes("\\")) continue;
        const fullPath = path.join(process.cwd(), "public", "uploads", rel);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          deleted++;
        }
      } catch (err) {
        console.warn(
          `[cleanup] Failed to delete local photo: ${url}`,
          (err as Error).message
        );
      }
    }
  }

  if (deleted > 0) {
    console.info(`[cleanup] Deleted ${deleted}/${urls.length} source photos`);
  }
  return deleted;
}

// ─── Delete legacy photos/ folders older than maxAgeHours (pre-refactor) ─────

export function cleanupOrphanedSessions(maxAgeHours = 24): number {
  if (!fs.existsSync(PHOTOS_DIR)) return 0;

  const now = Date.now();
  const maxAge = maxAgeHours * 3600 * 1000;
  let deletedDirs = 0;

  try {
    const entries = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dirPath = path.join(PHOTOS_DIR, entry.name);
      try {
        const stat = fs.statSync(dirPath);
        if (now - stat.mtimeMs > maxAge) {
          fs.rmSync(dirPath, { recursive: true, force: true });
          deletedDirs++;
        }
      } catch {
        // skip
      }
    }
  } catch (err) {
    console.warn("[cleanup] Failed to scan photos dir:", (err as Error).message);
  }

  if (deletedDirs > 0) {
    console.info(
      `[cleanup] Removed ${deletedDirs} orphaned legacy photo session(s)`
    );
  }
  return deletedDirs;
}

// ─── Delete temp_session_* uploads orphaned >maxAgeHours (new flow) ──────────

export interface TempCleanupResult {
  scanned: number;
  deletedSessions: number;
  deletedObjects: number;
}

export async function cleanupOrphanedTempSessions(
  maxAgeHours = 1
): Promise<TempCleanupResult> {
  const maxAgeMs = maxAgeHours * 3600 * 1000;
  const now = Date.now();
  const sessionIds = await listTempSessionIds();

  let deletedSessions = 0;
  let deletedObjects = 0;

  for (const sessionId of sessionIds) {
    // Keep if the order finished successfully — that's the only state we
    // really want to preserve. Anything else is fair game past the TTL.
    const order = getOrder(sessionId);
    if (order && order.status === "completed") {
      // Source photos should already be gone after PDF generation; this is a
      // belt-and-braces sweep.
      const removed = await emergencyCleanup(sessionId);
      if (removed > 0) {
        deletedObjects += removed;
        deletedSessions++;
      }
      continue;
    }

    // Use the pending session timestamp when available; otherwise treat as old.
    const pending = getPendingSession(sessionId);
    const createdAt = pending?.createdAt ?? 0;
    const age = now - createdAt;
    if (createdAt > 0 && age < maxAgeMs) continue;

    const removed = await emergencyCleanup(sessionId);
    deletedObjects += removed;
    if (removed > 0) deletedSessions++;
    deletePendingSession(sessionId);
  }

  if (deletedSessions > 0) {
    console.info(
      `[cleanup] Removed ${deletedSessions} orphaned temp_session_* (${deletedObjects} object(s))`
    );
  }
  return { scanned: sessionIds.length, deletedSessions, deletedObjects };
}
