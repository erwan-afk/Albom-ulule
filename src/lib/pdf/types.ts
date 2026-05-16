// ─── Template Configuration ───

export interface ClipPathCommand {
  op: "m" | "l" | "c"
  args: number[]
}

export interface ClipPath {
  transform: { tx: number; ty: number }
  commands: ClipPathCommand[]
}

export interface TemplateZone {
  id: number
  x_mm: number
  y_mm: number
  width_mm: number
  height_mm: number
  clipPath?: ClipPath
}

export interface TemplateLabel {
  enabled: boolean
  fontSize: number
  text: string
  x?: number
  y: number
  color: [number, number, number]
  align: "left" | "center" | "right"
}

export interface TemplateConfig {
  id: string
  name?: string
  productIds?: string[]
  productKeywords: string[]
  resolutionDpi: number
  label: TemplateLabel
  zones: TemplateZone[]
}

// ─── Image ───

export interface ProcessedImage {
  buffer: Buffer
  format: "jpeg" | "png"
}

// ─── Generate Input ───

export interface GeneratePdfInput {
  images: (ProcessedImage | null)[]
  customerName: string
  orderNumber: string
  template: TemplateConfig
}

// ─── PDF Parse Result ───

export interface ParsePdfResult {
  zones: TemplateZone[]
  cleanContentStream: string | null
  pageHeight: number
}
