"use client";

import * as React from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { PreviewCanvas } from "@/components/PreviewCanvas";
import { FrameControls } from "@/components/FrameControls";
import { ExportBar } from "@/components/ExportBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DEFAULT_FRAME_CONFIG } from "@/types/frame";
import type { FrameConfig } from "@/types/frame";
import { ImageIcon } from "lucide-react";

export default function Page() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [frameConfig, setFrameConfig] =
    React.useState<FrameConfig>(DEFAULT_FRAME_CONFIG);

  const firstImage = files.length > 0 ? files[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-card/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="relative p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <ImageIcon className="size-6 text-primary" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                    SnapToFrame
                  </span>
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Frame your images with custom sizes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">
                  Local Processing
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <ImageUploader files={files} onFilesChange={setFiles} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column: Preview & Export */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <PreviewCanvas imageFile={firstImage} config={frameConfig} />
            <ExportBar
              files={files}
              config={frameConfig}
              onConfigChange={setFrameConfig}
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
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-16 lg:mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-sm text-muted-foreground">
              All image processing happens in your browser. Your files never leave
              your device.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
              <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>100% Private & Secure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
