"use client";

import * as React from "react";
import { DownloadIcon, LoaderIcon, CheckIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldContent,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportSingleImage, exportBulkImages } from "@/lib/exportEngine";
import { processImagesInWorker } from "@/lib/workerUtils";
import { applyFrame, loadImageFromFile } from "@/lib/frameEngine";
import type { FrameConfig, ExportFormat } from "@/types/frame";
import { cn } from "@/lib/utils";

export interface ExportBarProps {
  files: File[];
  config: FrameConfig;
  onConfigChange: (config: FrameConfig) => void;
  disabled?: boolean;
  className?: string;
}

export function ExportBar({
  files,
  config,
  onConfigChange,
  disabled = false,
  className,
}: ExportBarProps) {
  const updateConfig = (updates: Partial<FrameConfig>) => {
    onConfigChange({ ...config, ...updates });
  };
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
    <Card className={cn("w-full border-border/50", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Export</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Export Format */}
          <Field>
            <FieldLabel>Export Format</FieldLabel>
            <FieldContent>
              <Select
                value={config.format}
                onValueChange={(value) =>
                  updateConfig({ format: value as ExportFormat })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Button
            onClick={handleSingleExport}
            disabled={!canExportSingle}
            className="w-full h-12 text-base font-semibold transition-all duration-200 hover:scale-[1.02]"
            size="lg"
          >
            {isProcessing && files.length === 1 ? (
              <>
                <LoaderIcon className="mr-2 size-5 animate-spin" />
                Processing...
              </>
            ) : exportSuccess && files.length === 1 ? (
              <>
                <CheckIcon className="mr-2 size-5" />
                Exported!
              </>
            ) : (
              <>
                <DownloadIcon className="mr-2 size-5" />
                Export Single Image
              </>
            )}
          </Button>

          <Button
            onClick={handleBulkExport}
            disabled={!canExportBulk}
            variant="outline"
            className="w-full h-12 text-base font-semibold border-2 hover:bg-muted/80 transition-all duration-200 hover:scale-[1.02]"
            size="lg"
          >
            {isProcessing && files.length >= 2 ? (
              <>
                <LoaderIcon className="mr-2 size-5 animate-spin" />
                Processing {progress.current}/{progress.total}...
              </>
            ) : exportSuccess && files.length >= 2 ? (
              <>
                <CheckIcon className="mr-2 size-5" />
                ZIP Exported!
              </>
            ) : (
              <>
                <DownloadIcon className="mr-2 size-5" />
                Export All as ZIP ({files.length} images)
              </>
            )}
          </Button>

          {isProcessing && progress.total > 0 && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-primary to-primary/80 h-full transition-all duration-300 rounded-full shadow-sm"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground font-medium">
                {Math.round((progress.current / progress.total) * 100)}% complete
              </p>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent rounded-xl border border-primary/20">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">
              <InfoIcon className="size-4" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Image quality depends on the quality of the uploaded image. For best results, use high-resolution source images.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
