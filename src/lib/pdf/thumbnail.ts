import { createCanvas, type Canvas, type CanvasRenderingContext2D as NodeCtx } from "canvas"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"

class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height)
    const context = canvas.getContext("2d")
    return { canvas, context }
  }
  reset(canvasAndContext: { canvas: Canvas; context: NodeCtx }, width: number, height: number) {
    canvasAndContext.canvas.width = width
    canvasAndContext.canvas.height = height
  }
  destroy(canvasAndContext: { canvas: Canvas | null; context: NodeCtx | null }) {
    if (canvasAndContext.canvas) {
      canvasAndContext.canvas.width = 0
      canvasAndContext.canvas.height = 0
    }
    canvasAndContext.canvas = null
    canvasAndContext.context = null
  }
}

/**
 * Génère une miniature PNG de la première page d'un PDF.
 */
export async function generateThumbnail(
  pdfBuffer: Buffer,
  width = 400
): Promise<Buffer> {
  const canvasFactory = new NodeCanvasFactory()

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
    useWorkerFetch: false,
    useSystemFonts: true,
    disableWorker: true,
    isEvalSupported: false,
    CanvasFactory: NodeCanvasFactory as any,
  } as any)
  const pdf = await loadingTask.promise

  const page = await pdf.getPage(1)
  const baseViewport = page.getViewport({ scale: 1 })
  const scale = width / baseViewport.width
  const viewport = page.getViewport({ scale })
  const height = Math.floor(viewport.height)

  const { canvas, context } = canvasFactory.create(width, height)

  // Fill white background — pdfjs doesn't paint paper color, leaves canvas transparent
  context.fillStyle = "white"
  context.fillRect(0, 0, width, height)

  await page.render({
    canvas: canvas as unknown as HTMLCanvasElement,
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport,
    background: "white",
  } as any).promise

  const buffer = canvas.toBuffer("image/png")
  await pdf.destroy()
  return buffer
}
