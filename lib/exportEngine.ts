import JSZip from 'jszip'

/**
 * Sanitize filename for safe download
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase()
    .substring(0, 100) // Limit length
}

/**
 * Export a single image as a download
 */
export function exportSingleImage(
  blob: Blob,
  filename: string,
  format: string
): void {
  const sanitized = sanitizeFilename(filename)
  const ext = format === 'jpg' ? 'jpg' : 'png'
  const fullFilename = `${sanitized}.${ext}`

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fullFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Cleanup after a delay to ensure download started
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Export multiple images as a ZIP file
 */
export async function exportBulkImages(
  blobs: Blob[],
  filenames: string[]
): Promise<void> {
  if (blobs.length === 0) {
    throw new Error('No images to export')
  }

  if (blobs.length !== filenames.length) {
    throw new Error('Blobs and filenames arrays must have the same length')
  }

  const zip = new JSZip()

  // Add each image to the ZIP
  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i]
    const filename = sanitizeFilename(filenames[i])
    const ext = blob.type.includes('jpeg') ? 'jpg' : 'png'
    const fullFilename = `${filename}.${ext}`

    zip.file(fullFilename, blob)
  }

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  // Trigger download
  const url = URL.createObjectURL(zipBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'framed_images.zip'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Cleanup
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}
