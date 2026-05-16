import { uploadPdf } from "@/lib/r2/upload";
import { deletePhotosByUrls } from "./cleanup";
import { downloadAndProcessAll } from "./imageDownloader";
import { generatePdf, getCellDimensions, ptToPx } from "./pdfGenerator";
import { findTemplateForProduct } from "./templateManager";

export type PdfGenerationInput = {
  orderName: string;
  photoUrls: string[];
  productTitle?: string;
  customerName?: string;
  baseUrl?: string;
};

export type PdfGenerationResult = {
  pdfUrl: string | null;
};

/**
 * Full pipeline:
 *  1. Match product title to a template
 *  2. Download & resize images to fit template zones
 *  3. Generate PDF with photos + overlay
 *  4. Upload to R2 (or local) and return URL
 *  5. Delete source photos to free space
 */
export async function generatePlaceholder(
  input: PdfGenerationInput
): Promise<PdfGenerationResult> {
  const fallback = process.env.PDF_PLACEHOLDER_URL;

  if (!input.photoUrls || input.photoUrls.length === 0) {
    console.warn("[pdf] No photo URLs provided, skipping");
    return { pdfUrl: null };
  }

  const productTitle = input.productTitle || "";
  const template = findTemplateForProduct(productTitle);

  if (!template) {
    console.info(`[pdf] No template for "${productTitle}", skipping`);
    return { pdfUrl: null };
  }

  try {
    // Calculate image dimensions from template
    const { cellWidth, cellHeight } = getCellDimensions(template);
    const dpi = template.resolutionDpi || 150;
    const cellWidthPx = ptToPx(cellWidth, dpi);
    const cellHeightPx = ptToPx(cellHeight, dpi);

    // Download and process images
    const uploads = input.photoUrls.map((url, i) => ({
      url,
      propertyName: `upload_${i + 1}`,
    }));
    const images = await downloadAndProcessAll(
      uploads,
      cellWidthPx,
      cellHeightPx
    );

    // Generate PDF
    const pdfBytes = await generatePdf({
      images,
      customerName: input.customerName || "Client",
      orderNumber: input.orderName,
      template,
    });

    // Upload PDF to R2 (or local)
    const upload = await uploadPdf(
      Buffer.from(pdfBytes),
      input.orderName,
      input.baseUrl
    );

    console.info(
      `[pdf] PDF generated: ${upload.url} (${(pdfBytes.length / 1024).toFixed(0)} KB)`
    );

    // ─── Delete source photos now that PDF is stored ───
    deletePhotosByUrls(input.photoUrls).catch((err) =>
      console.warn(
        "[pdf] Cleanup error (non-blocking):",
        (err as Error).message
      )
    );

    return { pdfUrl: upload.url };
  } catch (err) {
    console.error("[pdf] PDF generation failed:", err);

    if (fallback) {
      console.warn("[pdf] Returning fallback URL after failure");
      return { pdfUrl: fallback };
    }

    throw err;
  }
}
