import type { FrameConfig } from '@/types/frame'

/**
 * Pure function that applies a frame to an image using HTML Canvas 2D API.
 * Framework-agnostic - works with vanilla JS/TS.
 *
 * @param image - HTMLImageElement or ImageBitmap to frame
 * @param config - Frame configuration
 * @returns Promise resolving to a Blob of the framed image
 */
export async function applyFrame(
  image: HTMLImageElement | ImageBitmap,
  config: FrameConfig
): Promise<Blob> {
  // Create canvas at frame dimensions
  const canvas = document.createElement('canvas')
  canvas.width = config.width
  canvas.height = config.height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get 2D context from canvas')
  }

  // Fill background
  ctx.fillStyle = config.background
  ctx.fillRect(0, 0, config.width, config.height)

  // Calculate image area (frame minus padding)
  const imageAreaWidth = config.width - config.padding * 2
  const imageAreaHeight = config.height - config.padding * 2
  const imageAreaX = config.padding
  const imageAreaY = config.padding

  // Calculate scale and position based on fit mode
  let drawWidth: number
  let drawHeight: number
  let drawX: number
  let drawY: number

  const imageAspect = image.width / image.height
  const frameAspect = imageAreaWidth / imageAreaHeight

  if (config.fit === 'contain') {
    // Scale to fit within frame, maintaining aspect ratio
    if (imageAspect > frameAspect) {
      // Image is wider - fit to width
      drawWidth = imageAreaWidth
      drawHeight = imageAreaWidth / imageAspect
    } else {
      // Image is taller - fit to height
      drawHeight = imageAreaHeight
      drawWidth = imageAreaHeight * imageAspect
    }
    // Center the image
    drawX = imageAreaX + (imageAreaWidth - drawWidth) / 2
    drawY = imageAreaY + (imageAreaHeight - drawHeight) / 2
  } else {
    // cover mode - scale to cover entire frame, maintaining aspect ratio
    if (imageAspect > frameAspect) {
      // Image is wider - fit to height and crop width
      drawHeight = imageAreaHeight
      drawWidth = imageAreaHeight * imageAspect
    } else {
      // Image is taller - fit to width and crop height
      drawWidth = imageAreaWidth
      drawHeight = imageAreaWidth / imageAspect
    }
    // Center the image
    drawX = imageAreaX + (imageAreaWidth - drawWidth) / 2
    drawY = imageAreaY + (imageAreaHeight - drawHeight) / 2
  }

  // Apply shadow if enabled
  if (config.shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
  }

  // Apply border radius using clipping path
  if (config.borderRadius > 0) {
    ctx.save()
    const radius = Math.min(
      config.borderRadius,
      config.width / 2,
      config.height / 2
    )
    ctx.beginPath()
    ctx.roundRect(0, 0, config.width, config.height, radius)
    ctx.clip()
  }

  // Draw the image
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)

  // Restore context if we clipped
  if (config.borderRadius > 0) {
    ctx.restore()
  }

  // Export as blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      },
      config.format === 'jpg' ? 'image/jpeg' : 'image/png',
      0.95 // Quality for JPEG (ignored for PNG)
    )
  })
}

/**
 * Helper function to load an image from a File object
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load image: ${file.name}`))
    }

    img.src = url
  })
}

/**
 * Helper function to convert File to ImageBitmap (for Web Workers)
 */
export async function fileToImageBitmap(file: File): Promise<ImageBitmap> {
  const blob = await file.arrayBuffer()
  return await createImageBitmap(new Blob([blob], { type: file.type }))
}
