/** Nom du PDF dans le dossier session : {8 premiers chars du token}-albom.pdf */
export function sessionPdfFilename(sessionToken: string): string {
  return `${sessionToken.slice(0, 8)}-albom.pdf`
}

export function sessionPdfR2Key(sessionToken: string): string {
  return `sessions/${sessionToken}/${sessionPdfFilename(sessionToken)}`
}
