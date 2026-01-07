"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, LoaderIcon } from "lucide-react";
import { applyFrame, loadImageFromFile } from "@/lib/frameEngine";
import type { FrameConfig } from "@/types/frame";
import { cn } from "@/lib/utils";

export interface PreviewCanvasProps {
  imageFile: File | null;
  config: FrameConfig;
  className?: string;
}

export function PreviewCanvas({
  imageFile,
  config,
  className,
}: PreviewCanvasProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debounce config changes
  const debouncedConfig = useDebounce(config, 150);

  // Update preview when image or config changes
  React.useEffect(() => {
    if (!imageFile) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const updatePreview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load image
        const img = await loadImageFromFile(imageFile);

        if (cancelled) return;

        // Apply frame
        const blob = await applyFrame(img, debouncedConfig);

        if (cancelled) return;

        // Create preview URL
        const url = URL.createObjectURL(blob);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to generate preview"
          );
          console.error("Preview error:", err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    updatePreview();

    return () => {
      cancelled = true;
    };
  }, [imageFile, debouncedConfig]);

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Card className={cn("w-full border-border/50", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center min-h-[400px] bg-muted/40 border-2 border-dashed border-border rounded-xl relative overflow-hidden">
          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                              linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }} />
          
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {!imageFile ? (
              <div className="text-center text-muted-foreground space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="size-8" />
                </div>
                <div>
                  <p className="text-sm font-medium">No image uploaded</p>
                  <p className="text-xs mt-1">Upload an image to see preview</p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="text-center text-muted-foreground space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <LoaderIcon className="size-8 animate-spin text-primary" />
                </div>
                <p className="text-sm font-medium">Processing...</p>
              </div>
            ) : error ? (
              <div className="text-center text-destructive space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <p className="text-2xl">⚠️</p>
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : previewUrl ? (
              <div className="w-full flex items-center justify-center p-4">
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-[600px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ imageRendering: "crisp-edges" }}
                    onError={(e) => {
                      console.error("Image failed to load:", previewUrl);
                      setError("Failed to display preview image");
                    }}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <LoaderIcon className="size-8 animate-spin text-primary" />
                </div>
                <p className="text-sm font-medium">Preparing preview...</p>
              </div>
            )}
          </div>
        </div>
        {previewUrl && !isLoading && !error && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="px-3 py-1.5 rounded-full bg-muted/50 border border-border">
              <span className="font-medium">Frame:</span> {config.width} × {config.height}px
            </div>
            <div className="px-3 py-1.5 rounded-full bg-muted/50 border border-border">
              <span className="font-medium">Format:</span> {config.format.toUpperCase()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
