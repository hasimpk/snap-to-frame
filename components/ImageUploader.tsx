"use client";

import * as React from "react";
import { UploadIcon, XIcon, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  className?: string;
}

export function ImageUploader({
  files,
  onFilesChange,
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [previewUrls, setPreviewUrls] = React.useState<Map<string, string>>(
    new Map()
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Generate preview URLs for files
  React.useEffect(() => {
    const newUrls = new Map<string, string>();
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      newUrls.set(file.name, url);
    });

    setPreviewUrls(newUrls);

    // Cleanup: revoke URLs when files change or component unmounts
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const imageFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      alert("Please select image files only");
      return;
    }

    // Add new files to existing ones
    const newFiles = [...files, ...imageFiles];
    onFilesChange(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const fileList = e.dataTransfer.files;
    handleFiles(fileList);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={cn("w-full border-border/50", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Upload Images</CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "grid gap-6",
          files.length > 0
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}
      >
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.01] shadow-lg shadow-primary/10"
              : "border-border/60 dark:border-border/40 bg-muted/30 dark:bg-muted/20 hover:border-primary/50"
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
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center">
              <div
                className={cn(
                  "p-5 rounded-2xl transition-all duration-300 relative",
                  isDragging
                    ? "bg-primary/20 scale-110 shadow-lg shadow-primary/20"
                    : "bg-muted dark:bg-muted/50 group-hover:bg-primary/10 group-hover:scale-105 group-hover:shadow-md"
                )}
              >
                <UploadIcon
                  className={cn(
                    "size-10 transition-all duration-300",
                    isDragging
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
                  )}
                />
                {isDragging && (
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-foreground">
                Drag and drop images here
              </p>
              <p className="text-sm text-muted-foreground">
                or{" "}
                <span className="text-primary font-medium">
                  click to browse
                </span>
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="size-1.5 rounded-full bg-primary/60" />
                  <span>PNG</span>
                </div>
                <div className="size-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="size-1.5 rounded-full bg-primary/60" />
                  <span>JPG</span>
                </div>
                <div className="size-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="size-1.5 rounded-full bg-primary/60" />
                  <span>WEBP</span>
                </div>
              </div>
            </div>
          </div>
          {isDragging && (
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-5 md:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm font-semibold text-foreground">
                  {files.length} image{files.length !== 1 ? "s" : ""} uploaded
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilesChange([])}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {files.map((file, index) => {
                const previewUrl = previewUrls.get(file.name);
                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-white dark:bg-muted border border-border/60 dark:border-border w-24 h-24 transition-all duration-200 hover:scale-105 hover:border-primary/60 hover:shadow-md dark:hover:shadow-none"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <ImageIcon className="size-6 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute top-1.5 right-1.5 size-6 rounded-full bg-white/95 dark:bg-black/80 backdrop-blur-sm text-destructive dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:scale-110 hover:bg-white dark:hover:bg-black/90 border border-destructive/20 dark:border-white/20 shadow-md dark:shadow-lg z-10 cursor-pointer"
                      aria-label={`Remove ${file.name}`}
                    >
                      <XIcon className="size-3.5 stroke-[2.5]" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/70 to-black/40 dark:from-black/80 dark:via-black/60 dark:to-transparent text-white text-[10px] px-2.5 py-2 truncate font-medium backdrop-blur-[1px]">
                      {file.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
