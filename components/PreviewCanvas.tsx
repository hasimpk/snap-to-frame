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
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center min-h-[400px] bg-muted/30 border border-border">
          {!imageFile ? (
            <div className="text-center text-muted-foreground">
              <ImageIcon className="mx-auto mb-2 size-12" />
              <p className="text-sm">No image uploaded</p>
              <p className="text-xs mt-1">Upload an image to see preview</p>
            </div>
          ) : isLoading ? (
            <div className="text-center text-muted-foreground">
              <LoaderIcon className="mx-auto mb-2 size-12 animate-spin" />
              <p className="text-sm">Processing...</p>
            </div>
          ) : error ? (
            <div className="text-center text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          ) : previewUrl ? (
            <div className="w-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-[600px] object-contain"
                style={{ imageRendering: "crisp-edges" }}
                onError={(e) => {
                  console.error("Image failed to load:", previewUrl);
                  setError("Failed to display preview image");
                }}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <LoaderIcon className="mx-auto mb-2 size-12 animate-spin" />
              <p className="text-sm">Preparing preview...</p>
            </div>
          )}
        </div>
        {previewUrl && !isLoading && !error && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Frame: {config.width} × {config.height}px •{" "}
            {config.format.toUpperCase()}
          </p>
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
