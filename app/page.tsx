'use client'

import * as React from 'react'
import { ImageUploader } from '@/components/ImageUploader'
import { PreviewCanvas } from '@/components/PreviewCanvas'
import { FrameControls } from '@/components/FrameControls'
import { ExportBar } from '@/components/ExportBar'
import { DEFAULT_FRAME_CONFIG } from '@/types/frame'
import type { FrameConfig } from '@/types/frame'

export default function Page() {
  const [files, setFiles] = React.useState<File[]>([])
  const [frameConfig, setFrameConfig] = React.useState<FrameConfig>(
    DEFAULT_FRAME_CONFIG
  )

  const firstImage = files.length > 0 ? files[0] : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">SnapToFrame</h1>
          <p className="text-muted-foreground text-sm">
            Frame your images with custom sizes. All processing happens locally
            in your browser.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Image Upload */}
          <div className="lg:col-span-1">
            <ImageUploader files={files} onFilesChange={setFiles} />
          </div>

          {/* Center Column: Preview */}
          <div className="lg:col-span-1">
            <PreviewCanvas imageFile={firstImage} config={frameConfig} />
          </div>

          {/* Right Column: Controls & Export */}
          <div className="lg:col-span-1 space-y-6">
            <FrameControls
              config={frameConfig}
              onConfigChange={setFrameConfig}
              disabled={files.length === 0}
            />
            <ExportBar
              files={files}
              config={frameConfig}
              disabled={files.length === 0}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            All image processing happens in your browser. Your files never leave
            your device.
          </p>
        </div>
      </footer>
    </div>
  )
}
