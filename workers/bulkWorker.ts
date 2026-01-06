/**
 * Web Worker for bulk image processing
 * Uses OffscreenCanvas for frame rendering (no DOM dependencies)
 */

// FrameConfig type (inline to avoid path alias issues in workers)
interface FrameConfig {
  width: number
  height: number
  background: string
  padding: number
  fit: 'contain' | 'cover'
  borderRadius: number
  shadow: boolean
  shadowSpread: number
  border: boolean
  borderColor: string
  borderWidth: number
  borderStyle: 'solid' | 'dashed' | 'dotted'
  format: 'png' | 'jpg'
}

// Worker message types
interface ProcessImageMessage {
  type: 'process'
  id: string
  imageData: ImageData
  config: FrameConfig
}

interface WorkerResponse {
  type: 'result' | 'error'
  id: string
  blob?: Blob
  error?: string
}

// Frame processing function (duplicated from frameEngine.ts for worker compatibility)
async function applyFrameInWorker(
  imageData: ImageData,
  config: FrameConfig
): Promise<Blob> {
  // Create OffscreenCanvas
  const canvas = new OffscreenCanvas(config.width, config.height)
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get 2D context from OffscreenCanvas')
  }

  // Fill background first (no border radius on background)
  ctx.fillStyle = config.background
  ctx.fillRect(0, 0, config.width, config.height)

  // Calculate image area (frame minus padding)
  const imageAreaWidth = config.width - config.padding * 2
  const imageAreaHeight = config.height - config.padding * 2
  const imageAreaX = config.padding
  const imageAreaY = config.padding

  // Create temporary canvas for the source image
  const sourceCanvas = new OffscreenCanvas(imageData.width, imageData.height)
  const sourceCtx = sourceCanvas.getContext('2d')
  if (!sourceCtx) {
    throw new Error('Failed to get source canvas context')
  }
  sourceCtx.putImageData(imageData, 0, 0)

  // Calculate scale and position based on fit mode
  let drawWidth: number
  let drawHeight: number
  let drawX: number
  let drawY: number

  const imageAspect = imageData.width / imageData.height
  const frameAspect = imageAreaWidth / imageAreaHeight

  if (config.fit === 'contain') {
    // Scale to fit within frame, maintaining aspect ratio
    if (imageAspect > frameAspect) {
      drawWidth = imageAreaWidth
      drawHeight = imageAreaWidth / imageAspect
    } else {
      drawHeight = imageAreaHeight
      drawWidth = imageAreaHeight * imageAspect
    }
    drawX = imageAreaX + (imageAreaWidth - drawWidth) / 2
    drawY = imageAreaY + (imageAreaHeight - drawHeight) / 2
  } else {
    // cover mode
    if (imageAspect > frameAspect) {
      drawHeight = imageAreaHeight
      drawWidth = imageAreaHeight * imageAspect
    } else {
      drawWidth = imageAreaWidth
      drawHeight = imageAreaWidth / imageAspect
    }
    drawX = imageAreaX + (imageAreaWidth - drawWidth) / 2
    drawY = imageAreaY + (imageAreaHeight - drawHeight) / 2
  }

  // Apply border radius to image only
  if (config.borderRadius > 0) {
    ctx.save()
    const radius = Math.min(
      config.borderRadius,
      drawWidth / 2,
      drawHeight / 2
    )
    
    // Create clipping path for the actual image bounds (not the full image area)
    ctx.beginPath()
    // Top-left corner
    ctx.moveTo(drawX + radius, drawY)
    // Top edge
    ctx.lineTo(drawX + drawWidth - radius, drawY)
    // Top-right corner
    ctx.arc(
      drawX + drawWidth - radius,
      drawY + radius,
      radius,
      -Math.PI / 2,
      0,
      false
    )
    // Right edge
    ctx.lineTo(drawX + drawWidth, drawY + drawHeight - radius)
    // Bottom-right corner
    ctx.arc(
      drawX + drawWidth - radius,
      drawY + drawHeight - radius,
      radius,
      0,
      Math.PI / 2,
      false
    )
    // Bottom edge
    ctx.lineTo(drawX + radius, drawY + drawHeight)
    // Bottom-left corner
    ctx.arc(
      drawX + radius,
      drawY + drawHeight - radius,
      radius,
      Math.PI / 2,
      Math.PI,
      false
    )
    // Left edge
    ctx.lineTo(drawX, drawY + radius)
    // Top-left corner
    ctx.arc(
      drawX + radius,
      drawY + radius,
      radius,
      Math.PI,
      -Math.PI / 2,
      false
    )
    ctx.closePath()
    ctx.clip()
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
    ctx.drawImage(sourceCanvas, drawX, drawY, drawWidth, drawHeight)
    ctx.restore()
  } else {
    // No shadow - just apply border radius clipping if needed
    if (radius > 0) {
      ctx.save()
      createRoundedRectPath(drawX, drawY, drawWidth, drawHeight, radius)
      ctx.clip()
    }

    // Draw the image (clipped to rounded rectangle if borderRadius > 0)
    ctx.drawImage(sourceCanvas, drawX, drawY, drawWidth, drawHeight)

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
  const blob = await canvas.convertToBlob({
    type: config.format === 'jpg' ? 'image/jpeg' : 'image/png',
    quality: 0.95,
  })

  return blob
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<ProcessImageMessage>) => {
  const { type, id, imageData, config } = e.data

  if (type !== 'process') {
    return
  }

  try {
    const blob = await applyFrameInWorker(imageData, config)
    const response: WorkerResponse = {
      type: 'result',
      id,
      blob,
    }
    self.postMessage(response)
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
    self.postMessage(response)
  }
}
