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

  // Fill background first (no border radius on background)
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

  // Helper function to create rounded rectangle path
  const createRoundedRectPath = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath()
    // Top-left corner
    ctx.moveTo(x + radius, y)
    // Top edge
    ctx.lineTo(x + width - radius, y)
    // Top-right corner
    ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false)
    // Right edge
    ctx.lineTo(x + width, y + height - radius)
    // Bottom-right corner
    ctx.arc(
      x + width - radius,
      y + height - radius,
      radius,
      0,
      Math.PI / 2,
      false
    )
    // Bottom edge
    ctx.lineTo(x + radius, y + height)
    // Bottom-left corner
    ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false)
    // Left edge
    ctx.lineTo(x, y + radius)
    // Top-left corner
    ctx.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2, false)
    ctx.closePath()
  }

  const radius = config.borderRadius > 0
    ? Math.min(config.borderRadius, drawWidth / 2, drawHeight / 2)
    : 0

  // Draw shadow first using a shape that matches the image bounds
  if (config.shadow) {
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = config.shadowSpread
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = Math.max(2, config.shadowSpread / 5)

    if (radius > 0) {
      // Draw shadow using rounded rectangle path that matches image shape
      createRoundedRectPath(drawX, drawY, drawWidth, drawHeight, radius)
      // Use a visible fill to cast shadow, but we'll composite it behind
      ctx.fillStyle = '#000000'
      ctx.fill()
    } else {
      // Draw shadow using rectangle
      ctx.fillStyle = '#000000'
      ctx.fillRect(drawX, drawY, drawWidth, drawHeight)
    }
    ctx.restore()
    
    // Now draw image on top using source-over (default), hiding the black shape but keeping shadow
    ctx.save()
    
    // Apply border radius clipping to image only
    if (radius > 0) {
      createRoundedRectPath(drawX, drawY, drawWidth, drawHeight, radius)
      ctx.clip()
    }
    
    // Draw the image on top (this will hide the black shape but shadow remains visible)
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
    ctx.restore()
  } else {
    // No shadow - just apply border radius clipping if needed
    if (radius > 0) {
      ctx.save()
      createRoundedRectPath(drawX, drawY, drawWidth, drawHeight, radius)
      ctx.clip()
    }

    // Draw the image (clipped to rounded rectangle if borderRadius > 0)
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)

    // Restore context if we clipped (removes clipping path)
    if (radius > 0) {
      ctx.restore()
    }
  }

  // Draw border if enabled
  if (config.border && config.borderWidth > 0) {
    ctx.save()
    
    // Set border style
    ctx.strokeStyle = config.borderColor
    ctx.lineWidth = config.borderWidth
    
    // Apply border style
    if (config.borderStyle === 'dashed') {
      ctx.setLineDash([8, 4])
    } else if (config.borderStyle === 'dotted') {
      ctx.setLineDash([2, 4])
    } else {
      ctx.setLineDash([])
    }
    
    // Draw border path matching the image bounds
    if (radius > 0) {
      createRoundedRectPath(drawX, drawY, drawWidth, drawHeight, radius)
    } else {
      ctx.beginPath()
      ctx.rect(drawX, drawY, drawWidth, drawHeight)
    }
    ctx.stroke()
    
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
