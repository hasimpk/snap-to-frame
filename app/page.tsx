"use client";

import * as React from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { PreviewCanvas } from "@/components/PreviewCanvas";
import { FrameControls } from "@/components/FrameControls";
import { ExportBar } from "@/components/ExportBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DEFAULT_FRAME_CONFIG } from "@/types/frame";
import type { FrameConfig } from "@/types/frame";

export default function Page() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [frameConfig, setFrameConfig] =
    React.useState<FrameConfig>(DEFAULT_FRAME_CONFIG);

  const firstImage = files.length > 0 ? files[0] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">SnapToFrame</h1>
              <p className="text-muted-foreground text-xs">
                Frame your images with custom sizes. All processing happens
                locally in your browser.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <ImageUploader files={files} onFilesChange={setFiles} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Image Upload */}

          {/* Center Column: Preview & Export */}
          <div className="lg:col-span-1 space-y-6">
            <PreviewCanvas imageFile={firstImage} config={frameConfig} />
            <ExportBar
              files={files}
              config={frameConfig}
              disabled={files.length === 0}
            />
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-1">
            <FrameControls
              config={frameConfig}
              onConfigChange={setFrameConfig}
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
  );
}
