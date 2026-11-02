import { Buffer } from "node:buffer"
import sharp from "sharp"

export interface ProcessedAvatar {
  buffer: Uint8Array
  ext: string
  mimeType: string
}

const SKIP_SIZE_THRESHOLD = 100 * 1024 // 100 KB
const TARGET_DIMENSION = 400 // 400x400px standard avatar size
const WEBP_QUALITY = 80

/**
 * Processes an uploaded avatar image.
 * Skips heavy re-encoding if the file is already <= 100KB, square-fitted (<= 400x400),
 * and in an optimized web format (webp/jpeg).
 */
export async function processAvatarImage(input: ArrayBuffer): Promise<ProcessedAvatar> {
  const inputBuffer = Buffer.from(input)
  const image = sharp(inputBuffer)
  const metadata = await image.metadata()

  if (!metadata.format || !metadata.width || !metadata.height) {
    throw new Error("INVALID_IMAGE")
  }

  const isSmallEnough = inputBuffer.byteLength <= SKIP_SIZE_THRESHOLD
  const isDimensionOptimal =
    metadata.width <= TARGET_DIMENSION &&
    metadata.height <= TARGET_DIMENSION &&
    metadata.width === metadata.height
  const isOptimalFormat = metadata.format === "webp" || metadata.format === "jpeg"

  // Fast-path: Client already compressed and cropped the image
  if (isSmallEnough && isDimensionOptimal && isOptimalFormat) {
    const ext = metadata.format === "jpeg" ? "jpg" : "webp"
    return {
      buffer: new Uint8Array(inputBuffer),
      ext,
      mimeType: `image/${metadata.format}`,
    }
  }

  // Full processing: Auto-orient via EXIF, center-crop to 400x400 square, convert to WebP
  const outputBuffer = await image
    // .rotate() // Auto-orient based on EXIF before stripping metadata
    .resize(TARGET_DIMENSION, TARGET_DIMENSION, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer()

  return {
    buffer: new Uint8Array(outputBuffer),
    ext: "webp",
    mimeType: "image/webp",
  }
}