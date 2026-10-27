/**
 * Browser-side image compressor for Sampige Foundation admin uploads.
 * Keeps us on Supabase Free tier by shrinking images BEFORE upload.
 * No server, no paid Image Transformations required.
 */

export type CompressOptions = {
  /** Max width or height in pixels (default 1600) */
  maxDimension?: number
  /** JPEG/WebP quality 0–1 (default 0.80) */
  quality?: number
  /** Prefer WebP when the browser supports it (default true) */
  preferWebP?: boolean
}

export type CompressResult = {
  file: File
  /** Original size in bytes */
  originalSize: number
  /** Compressed size in bytes */
  compressedSize: number
  /** e.g. "4.2 MB → 280 KB (93% smaller)" */
  summary: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function loadImage(file: Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this image. Try a different JPG or PNG.'))
    }
    img.src = url
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Image compression failed. Please try another file.'))
          return
        }
        resolve(blob)
      },
      type,
      quality
    )
  })
}

/**
 * Compress an image file or blob in the browser.
 * - Resizes so the longest side ≤ maxDimension
 * - Encodes as WebP (or JPEG fallback) at the given quality
 * - If compression somehow makes the file larger, returns the original
 */
export async function compressImage(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const maxDimension = options.maxDimension ?? 1600
  const quality = options.quality ?? 0.8
  const preferWebP = options.preferWebP ?? true

  // Safely extract filename and type (handles Blobs without .name)
  const rawName = (file as File).name || 'image.jpg'
  const fileType = file.type || 'image/jpeg'

  // Non-images: return as-is
  if (fileType && !fileType.startsWith('image/')) {
    const fallbackFile = file instanceof File ? file : new File([file], rawName, { type: fileType })
    return {
      file: fallbackFile,
      originalSize: file.size,
      compressedSize: file.size,
      summary: `${formatBytes(file.size)} (not an image — skipped)`,
    }
  }

  // Tiny files already under ~200KB: skip work
  if (file.size < 200 * 1024) {
    const fallbackFile = file instanceof File ? file : new File([file], rawName, { type: fileType })
    return {
      file: fallbackFile,
      originalSize: file.size,
      compressedSize: file.size,
      summary: `${formatBytes(file.size)} (already small — skipped)`,
    }
  }

  const img = await loadImage(file)
  const { naturalWidth: w, naturalHeight: h } = img

  // Scale down if needed (never upscale)
  const longest = Math.max(w, h)
  const scale = longest > maxDimension ? maxDimension / longest : 1
  const targetW = Math.max(1, Math.round(w * scale))
  const targetH = Math.max(1, Math.round(h * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Your browser could not compress this image.')
  }

  // White background so transparent PNGs don't become black in JPEG
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, targetW, targetH)
  ctx.drawImage(img, 0, 0, targetW, targetH)

  const supportsWebP =
    preferWebP &&
    canvas.toDataURL('image/webp').startsWith('data:image/webp')

  const outputType = supportsWebP ? 'image/webp' : 'image/jpeg'
  const ext = supportsWebP ? 'webp' : 'jpg'

  const blob = await canvasToBlob(canvas, outputType, quality)

  // If compressed is larger, keep original
  if (blob.size >= file.size) {
    const fallbackFile = file instanceof File ? file : new File([file], rawName, { type: fileType })
    return {
      file: fallbackFile,
      originalSize: file.size,
      compressedSize: file.size,
      summary: `${formatBytes(file.size)} (compression not helpful — kept original)`,
    }
  }

  // SAFE: Safe extraction of baseName even when rawName has no extension or file is a Blob
  const baseName = rawName.includes('.') ? rawName.replace(/\.[^.]+$/, '') : rawName
  const compressedFile = new File([blob], `${baseName}.${ext}`, {
    type: outputType,
    lastModified: Date.now(),
  })

  const saved = file.size - blob.size
  const pct = Math.round((saved / file.size) * 100)

  return {
    file: compressedFile,
    originalSize: file.size,
    compressedSize: blob.size,
    summary: `${formatBytes(file.size)} → ${formatBytes(blob.size)} (${pct}% smaller)`,
  }
}