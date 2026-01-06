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

  // Fill background
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
  ctx.drawImage(sourceCanvas, drawX, drawY, drawWidth, drawHeight)

  // Restore context if we clipped
  if (config.borderRadius > 0) {
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
