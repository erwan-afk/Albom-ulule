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
  /** Taille du numéro de commande (ligne secondaire) */
  secondaryFontSize?: number
  text: string
  x?: number
  y: number
  marginRight?: number
  color: [number, number, number]
  /** Couleur plus discrète pour le numéro de commande */
  secondaryColor?: [number, number, number]
  align: "left" | "center" | "right"
}

export interface TemplateConfig {
  id: string
  name?: string
  productIds?: string[]
  productKeywords: string[]
  resolutionDpi: number
  label: TemplateLabel
  /** Zone texte dynamique (calque info-1 dans Illustrator), ex. case 8 */
  brandingZone?: TemplateZone | null
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
  sessionId?: string
  template: TemplateConfig
}

// ─── PDF Parse Result ───

export interface ParsePdfResult {
  zones: TemplateZone[]
  brandingZone: TemplateZone | null
  cleanContentStream: string | null
  pageHeight: number
}
