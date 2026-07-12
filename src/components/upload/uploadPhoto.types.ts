export type CropState = {
  crop: { x: number; y: number }
  zoom: number
}

export type UploadPhoto = {
  id: string
  previewUrl: string
  sourceFile?: File
  cropBlob?: Blob
  cropPreviewUrl?: string
  cropState?: CropState
  imageAspect?: number
  status: "pending" | "cropping" | "uploading" | "ready" | "error"
  error?: string
  selected: boolean
}
