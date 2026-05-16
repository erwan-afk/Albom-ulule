"use client"

import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`

const documentOptions = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
}

type Props = {
  url: string
  width?: number
}

export default function PdfThumbnail({ url, width = 200 }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 text-muted-foreground no-underline"
      >
        <span className="text-2xl">📄</span>
        <span className="text-[10px] text-destructive">
          Aperçu indisponible
        </span>
        <span className="text-[10px] text-primary">Ouvrir le PDF ↗</span>
      </a>
    )
  }

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden [&_.react-pdf__Page]:!bg-transparent [&_canvas]:!h-auto [&_canvas]:!w-auto [&_canvas]:max-h-full [&_canvas]:max-w-full [&_canvas]:object-contain">
      <Document
        file={url}
        options={documentOptions}
        onLoadError={() => setFailed(true)}
        loading={
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Chargement…
          </div>
        }
        error={null}
      >
        <Page
          pageNumber={1}
          width={width}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          onRenderError={() => setFailed(true)}
        />
      </Document>
    </div>
  )
}
