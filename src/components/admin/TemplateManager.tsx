"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { BiLoaderAlt } from "react-icons/bi"

const PdfThumbnail = dynamic(() => import("./PdfThumbnail"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      Chargement…
    </div>
  ),
})

export interface TemplateItem {
  id: string
  name: string
  zonesCount: number
  productKeywords: string[]
  hasBackground: boolean
  hasOverlay: boolean
  hasThumbnail: boolean
  updatedAt?: number
}

type Props = {
  templates: TemplateItem[]
  onRefresh: () => void
}

export function TemplateManager({ templates, onRefresh }: Props) {
  const [uploadTplId, setUploadTplId] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<{
    text: string
    ok: boolean
  } | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newId, setNewId] = useState("")
  const [newName, setNewName] = useState("")
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  // ─── Gestionnaires ───

  const handleCreateTemplate = async () => {
    const id = newId.trim().replace(/[^a-zA-Z0-9_-]/g, "")
    const name = newName.trim()
    if (!id || !name) {
      setUploadMsg({ text: "Remplis l'ID et le nom", ok: false })
      return
    }
    setUploading(true)
    setUploadMsg(null)
    try {
      const res = await fetch(`/api/admin/pdf/templates/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name,
          productKeywords: [],
          resolutionDpi: 150,
          label: {
            enabled: true,
            fontSize: 8,
            text: "{customerName} — {orderNumber}",
            y: 15,
            color: [0.3, 0.3, 0.3],
            align: "center",
          },
          zones: [],
        }),
      })
      if (res.ok) {
        setUploadMsg({ text: `✅ Template "${name}" créé`, ok: true })
        setShowCreate(false)
        setNewId("")
        setNewName("")
        onRefresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setUploadMsg({ text: data.error || "Erreur", ok: false })
      }
    } catch (e: any) {
      setUploadMsg({ text: e?.message || "Erreur réseau", ok: false })
    } finally {
      setUploading(false)
    }
  }

  const handleStartRename = (tpl: TemplateItem) => {
    setRenamingId(tpl.id)
    setRenameValue(tpl.name)
  }

  const handleSaveRename = async (tpl: TemplateItem) => {
    const newNameTrimmed = renameValue.trim()
    if (!newNameTrimmed || newNameTrimmed === tpl.name) {
      setRenamingId(null)
      return
    }
    setUploading(true)
    setUploadMsg(null)
    try {
      const res = await fetch(`/api/admin/pdf/templates/${tpl.id}`)
      if (!res.ok) throw new Error("Template introuvable")
      const config = await res.json()
      config.name = newNameTrimmed
      const saveRes = await fetch(`/api/admin/pdf/templates/${tpl.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (saveRes.ok) {
        setUploadMsg({
          text: `✅ Template renommé en "${newNameTrimmed}"`,
          ok: true,
        })
        onRefresh()
      } else {
        const data = await saveRes.json().catch(() => ({}))
        setUploadMsg({ text: data.error || "Erreur", ok: false })
      }
    } catch (e: any) {
      setUploadMsg({ text: e?.message || "Erreur réseau", ok: false })
    } finally {
      setUploading(false)
      setRenamingId(null)
    }
  }

  const handleDeleteTemplate = async (tpl: TemplateItem) => {
    if (tpl.id === "default") {
      setUploadMsg({
        text: "Impossible de supprimer le template par défaut",
        ok: false,
      })
      return
    }
    if (!confirm(`Supprimer le template "${tpl.name}" ?`)) return
    setUploading(true)
    setUploadMsg(null)
    try {
      const res = await fetch(`/api/admin/pdf/templates/${tpl.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setUploadMsg({ text: `🗑️ Template "${tpl.name}" supprimé`, ok: true })
        onRefresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setUploadMsg({ text: data.error || "Erreur", ok: false })
      }
    } catch (e: any) {
      setUploadMsg({ text: e?.message || "Erreur réseau", ok: false })
    } finally {
      setUploading(false)
    }
  }

  const handleUploadPdf = async (tplId: string, file: File) => {
    setUploadTplId(tplId)
    setUploading(true)
    setUploadMsg(null)
    try {
      const fd = new FormData()
      fd.append("pdf", file)
      const res = await fetch(`/api/admin/pdf/templates/${tplId}/pdf`, {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (res.ok) {
        setUploadMsg({
          text: `✅ PDF chargé pour "${tplId}"`,
          ok: true,
        })
        setTimeout(() => onRefresh(), 2000)
      } else {
        setUploadMsg({
          text: data.error || "Erreur upload",
          ok: false,
        })
      }
    } catch (err: any) {
      setUploadMsg({
        text: err?.message || "Erreur réseau",
        ok: false,
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            📄 Templates PDF disponibles
          </h3>
          <p className="text-sm text-muted-foreground">
            Aperçu des templates et chargement de PDF
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{
            background: showCreate ? "#ef4444" : "#10b981",
            color: "#fff",
          }}
        >
          {showCreate ? "✕ Annuler" : "+ Créer"}
        </button>
      </div>

      {/* Inline create form */}
      {showCreate && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
          <input
            placeholder="ID (ex: peluche)"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            className="w-36 rounded-md border px-3 py-1.5 text-sm"
          />
          <input
            placeholder="Nom (ex: Peluche XXL)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="min-w-[160px] flex-1 rounded-md border px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleCreateTemplate}
            disabled={uploading}
            className="rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {uploading ? "…" : "Créer"}
          </button>
        </div>
      )}

      {/* Grille des templates */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {templates.map((t) => (
          <div
            key={t.id}
            className="overflow-hidden rounded-lg border bg-muted/30"
          >
            {/* Thumbnail */}
            <div className="flex h-[220px] items-center justify-center border-b bg-[#e5e5e5]">
              {t.hasBackground || t.hasOverlay ? (
                <PdfThumbnail
                  key={`${t.id}-${t.updatedAt || 0}`}
                  url={`/api/admin/pdf/templates/${t.id}/pdf?v=${t.updatedAt || 0}`}
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <span className="text-3xl">📄</span>
                  <span className="text-[11px]">Aucun PDF</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="mb-1 flex items-center justify-between">
                {renamingId === t.id ? (
                  <div className="flex flex-1 items-center gap-1">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(t)
                        if (e.key === "Escape") setRenamingId(null)
                      }}
                      className="w-full rounded border border-primary px-1.5 py-0.5 text-[13px] font-semibold"
                    />
                    <button
                      onClick={() => handleSaveRename(t)}
                      title="Enregistrer"
                      className="rounded bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setRenamingId(null)}
                      title="Annuler"
                      className="rounded px-1 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-[13px] font-semibold text-foreground">
                    {t.name}
                  </span>
                )}
                {renamingId !== t.id && (
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => handleStartRename(t)}
                      title="Renommer"
                      className="px-1 text-[13px] text-muted-foreground hover:text-primary"
                    >
                      ✏️
                    </button>
                    {t.id !== "default" && (
                      <button
                        onClick={() => handleDeleteTemplate(t)}
                        title="Supprimer"
                        className="px-1 text-sm text-muted-foreground hover:text-destructive"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="mb-1.5 text-[11px] text-muted-foreground">
                {t.zonesCount} zone{t.zonesCount > 1 ? "s" : ""}
                {t.hasBackground || t.hasOverlay
                  ? ` — ${t.hasOverlay ? "overlay" : "background"}`
                  : " — pas de PDF"}
              </div>

              {/* Keywords */}
              {t.productKeywords.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {t.productKeywords.slice(0, 3).map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-indigo-50 px-1.5 py-px text-[10px] text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300"
                    >
                      {kw.length > 20 ? kw.slice(0, 20) + "…" : kw}
                    </span>
                  ))}
                  {t.productKeywords.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{t.productKeywords.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Upload button */}
              <label className="flex cursor-pointer items-center justify-center rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90">
                {uploading && uploadTplId === t.id ? (
                  <BiLoaderAlt className="animate-spin" size={11} />
                ) : (
                  "📤 Charger PDF"
                )}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadPdf(t.id, file)
                    e.target.value = ""
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {uploadMsg && (
        <p
          className="mt-4 text-sm"
          style={{ color: uploadMsg.ok ? "#10b981" : "#ef4444" }}
        >
          {uploadMsg.text}
        </p>
      )}
    </div>
  )
}

