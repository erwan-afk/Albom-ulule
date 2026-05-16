/**
 * Pending sessions — tracks temporary photo uploads before PDF generation.
 *
 * In production with multiple instances, you should use Redis or a DB table.
 * For now, we use an in-memory Map with Prisma as optional persistence.
 */

export interface PendingSession {
  sessionId: string
  orderGid: string
  orderName: string
  customerName: string
  productTitle: string
  productGid?: string
  tempKeys: string[]
  createdAt: number
}

// In-memory store
const sessions = new Map<string, PendingSession>()

// Cleanup old sessions every 10 minutes
const SESSION_TTL_MS = 30 * 60 * 1000 // 30 minutes

function cleanupExpired(): void {
  const now = Date.now()
  for (const [id, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(id)
    }
  }
}

// Periodic cleanup
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpired, 10 * 60 * 1000)
}

export function createPendingSession(session: PendingSession): void {
  sessions.set(session.sessionId, session)
  console.info(`[session] Created pending session ${session.sessionId}`)
}

export function getPendingSession(
  sessionId: string,
): PendingSession | undefined {
  return sessions.get(sessionId)
}

export function deletePendingSession(sessionId: string): void {
  sessions.delete(sessionId)
  console.info(`[session] Deleted pending session ${sessionId}`)
}

export function addTempKey(
  sessionId: string,
  key: string,
): boolean {
  const session = sessions.get(sessionId)
  if (!session) return false
  session.tempKeys.push(key)
  return true
}

export function getAllPendingSessions(): PendingSession[] {
  return Array.from(sessions.values())
}
