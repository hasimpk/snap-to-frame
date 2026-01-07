"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  colorInputClassName?: string;
  textInputClassName?: string;
}

export function ColorPicker({
  value,
  onChange,
  disabled = false,
  placeholder = "#ffffff",
  className,
  colorInputClassName,
  textInputClassName,
}: ColorPickerProps) {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div
      className={cn(
        "flex items-center border-input focus-within:border-ring focus-within:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-9 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] aria-invalid:ring-[3px] w-full min-w-0 outline-none overflow-hidden",
        className
      )}
    >
      <Input
        type="color"
        value={value}
        onChange={handleColorChange}
        disabled={disabled}
        className={cn(
          "h-9 w-20 cursor-pointer border-none shadow-none rounded-none",
          colorInputClassName
        )}
      />
      <Input
        type="text"
        value={value}
        onChange={handleTextChange}
        disabled={disabled}
        placeholder={placeholder}
        pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
        className={cn(
          "h-9 w-full border-none shadow-none rounded-none",
          textInputClassName
        )}
      />
    </div>
  );
}
