"use client";

import * as React from "react";
import { DownloadIcon, LoaderIcon, CheckIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exportSingleImage, exportBulkImages } from "@/lib/exportEngine";
import { processImagesInWorker } from "@/lib/workerUtils";
import { applyFrame, loadImageFromFile } from "@/lib/frameEngine";
import type { FrameConfig } from "@/types/frame";
import { cn } from "@/lib/utils";

export interface ExportBarProps {
  files: File[];
  config: FrameConfig;
  disabled?: boolean;
  className?: string;
}

export function ExportBar({
  files,
  config,
  disabled = false,
  className,
}: ExportBarProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState({ current: 0, total: 0 });
  const [exportSuccess, setExportSuccess] = React.useState(false);

  const handleSingleExport = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setExportSuccess(false);

    try {
      const firstFile = files[0];
      const img = await loadImageFromFile(firstFile);
      const blob = await applyFrame(img, config);

      const baseName = firstFile.name.replace(/\.[^/.]+$/, "");
      exportSingleImage(blob, baseName, config.format);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error("Export failed:", error);
      alert(
        `Export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = async () => {
    if (files.length < 2) return;

    setIsProcessing(true);
    setExportSuccess(false);
    setProgress({ current: 0, total: files.length });

    try {
      const tasks = files.map((file, index) => ({
        id: `task-${index}`,
        file,
        config,
      }));

      const { results, errors } = await processImagesInWorker(
        tasks,
        (current, total) => {
          setProgress({ current, total });
        }
      );

      if (errors.length > 0) {
        console.warn("Some images failed to process:", errors);
        if (results.length === 0) {
          throw new Error("All images failed to process");
        }
      }

      if (results.length > 0) {
        const blobs = results.map((r) => r.blob);
        const filenames = results.map((r) => r.filename);
        await exportBulkImages(blobs, filenames);

        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Bulk export failed:", error);
      alert(
        `Bulk export failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const canExportSingle = files.length > 0 && !isProcessing && !disabled;
  const canExportBulk = files.length >= 2 && !isProcessing && !disabled;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent>
        <div className="space-y-3">
          <Button
            onClick={handleSingleExport}
            disabled={!canExportSingle}
            className="w-full"
            size="lg"
          >
            {isProcessing && files.length === 1 ? (
              <>
                <LoaderIcon className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : exportSuccess && files.length === 1 ? (
              <>
                <CheckIcon className="mr-2 size-4" />
                Exported!
              </>
            ) : (
              <>
                <DownloadIcon className="mr-2 size-4" />
                Export Single Image
              </>
            )}
          </Button>

          <Button
            onClick={handleBulkExport}
            disabled={!canExportBulk}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isProcessing && files.length >= 2 ? (
              <>
                <LoaderIcon className="mr-2 size-4 animate-spin" />
                Processing {progress.current}/{progress.total}...
              </>
            ) : exportSuccess && files.length >= 2 ? (
              <>
                <CheckIcon className="mr-2 size-4" />
                ZIP Exported!
              </>
            ) : (
              <>
                <DownloadIcon className="mr-2 size-4" />
                Export All as ZIP ({files.length} images)
              </>
            )}
          </Button>

          {isProcessing && progress.total > 0 && (
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              />
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md border border-border">
            <InfoIcon className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Image quality depends on the quality of the uploaded image. For best results, use high-resolution source images.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
