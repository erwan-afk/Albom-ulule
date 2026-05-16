export { generatePlaceholder } from "./generatePlaceholder";
export type {
  PdfGenerationInput,
  PdfGenerationResult,
} from "./generatePlaceholder";

export { generatePdf, getCellDimensions, ptToPx } from "./pdfGenerator";
export type { GeneratePdfInput } from "./types";

export { downloadAndProcessAll } from "./imageDownloader";
export type { UploadItem } from "./imageDownloader";

export { parsePdfTemplate, createCleanPdf } from "./pdfParser";

export {
  listTemplates,
  getTemplate,
  getTemplatePdfPath,
  findTemplateForProduct,
  saveTemplate,
  saveTemplatePdf,
  deleteTemplate,
} from "./templateManager";
export type { TemplateListItem } from "./templateManager";

export type {
  ClipPathCommand,
  ClipPath,
  TemplateZone,
  TemplateLabel,
  TemplateConfig,
  ProcessedImage,
  ParsePdfResult,
} from "./types";
