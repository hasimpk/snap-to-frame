import type { FrameConfig } from '@/types/frame'

export interface ProcessImageTask {
  id: string
  file: File
  config: FrameConfig
}

export interface ProcessImageResult {
  id: string
  blob: Blob
  filename: string
}

export interface ProcessImageError {
  id: string
  error: string
  filename: string
}

/**
 * Process multiple images using a Web Worker
 */
export async function processImagesInWorker(
  tasks: ProcessImageTask[],
  onProgress?: (processed: number, total: number) => void
): Promise<{
  results: ProcessImageResult[]
  errors: ProcessImageError[]
}> {
  const results: ProcessImageResult[] = []
  const errors: ProcessImageError[] = []

  // Create worker - use relative path for Next.js compatibility
  // Note: In production, this will need to be a compiled .js file
  const workerUrl = new URL('../workers/bulkWorker.ts', import.meta.url)
  const worker = new Worker(workerUrl, { type: 'module' })

  // Set up worker message handler
  const pendingTasks = new Map<string, ProcessImageTask>()

  worker.onmessage = async (e) => {
    const { type, id, blob, error } = e.data

    const task = pendingTasks.get(id)
    if (!task) return

    pendingTasks.delete(id)

    if (type === 'result' && blob) {
      // Generate filename
      const ext = task.config.format === 'jpg' ? 'jpg' : 'png'
      const baseName = task.file.name.replace(/\.[^/.]+$/, '')
      const filename = `${baseName}_framed.${ext}`

      results.push({
        id,
        blob,
        filename,
      })
    } else if (type === 'error') {
      errors.push({
        id,
        error: error || 'Unknown error',
        filename: task.file.name,
      })
    }

    // Report progress
    if (onProgress) {
      const processed = results.length + errors.length
      onProgress(processed, tasks.length)
    }

    // If all tasks are done, terminate worker
    if (pendingTasks.size === 0) {
      worker.terminate()
    }
  }

  // Process each image
  for (const task of tasks) {
    try {
      // Convert file to ImageBitmap, then to ImageData
      const imageBitmap = await createImageBitmap(task.file)
      const canvas = new OffscreenCanvas(
        imageBitmap.width,
        imageBitmap.height
      )
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }
      ctx.drawImage(imageBitmap, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      imageBitmap.close()

      // Send to worker
      pendingTasks.set(task.id, task)
      worker.postMessage({
        type: 'process',
        id: task.id,
        imageData,
        config: task.config,
      })
    } catch (error) {
      errors.push({
        id: task.id,
        error: error instanceof Error ? error.message : 'Failed to process image',
        filename: task.file.name,
      })
    }
  }

  // Wait for all tasks to complete
  return new Promise((resolve) => {
    const checkComplete = () => {
      if (pendingTasks.size === 0) {
        resolve({ results, errors })
      } else {
        setTimeout(checkComplete, 100)
      }
    }
    checkComplete()
  })
}
