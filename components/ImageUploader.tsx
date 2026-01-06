'use client'

import * as React from 'react'
import { UploadIcon, XIcon, ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ImageUploaderProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  className?: string
}

export function ImageUploader({
  files,
  onFilesChange,
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [previewUrls, setPreviewUrls] = React.useState<Map<string, string>>(
    new Map()
  )
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Generate preview URLs for files
  React.useEffect(() => {
    const newUrls = new Map<string, string>()
    files.forEach((file) => {
      const url = URL.createObjectURL(file)
      newUrls.set(file.name, url)
    })

    setPreviewUrls(newUrls)

    // Cleanup: revoke URLs when files change or component unmounts
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return

    const imageFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith('image/')
    )

    if (imageFiles.length === 0) {
      alert('Please select image files only')
      return
    }

    // Add new files to existing ones
    const newFiles = [...files, ...imageFiles]
    onFilesChange(newFiles)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const fileList = e.dataTransfer.files
    handleFiles(fileList)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Upload Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <UploadIcon className="mx-auto mb-2 size-8 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            Drag and drop images here, or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            Supports multiple images
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {files.length} image{files.length !== 1 ? 's' : ''} uploaded
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {files.map((file, index) => {
                const previewUrl = previewUrls.get(file.name)
                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative group aspect-square rounded-md overflow-hidden border border-border bg-muted"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="size-8 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="absolute top-1 right-1 size-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      aria-label={`Remove ${file.name}`}
                    >
                      <XIcon className="size-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                      {file.name}
                    </div>
                  </div>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFilesChange([])}
              className="w-full"
            >
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
