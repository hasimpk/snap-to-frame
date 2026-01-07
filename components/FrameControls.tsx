"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type {
  FrameConfig,
  FitMode,
  BorderStyle,
  BackgroundType,
} from "@/types/frame";
import { FRAME_PRESETS } from "@/types/frame";
import { cn } from "@/lib/utils";

export interface FrameControlsProps {
  config: FrameConfig;
  onConfigChange: (config: FrameConfig) => void;
  disabled?: boolean;
  className?: string;
}

export function FrameControls({
  config,
  onConfigChange,
  disabled = false,
  className,
}: FrameControlsProps) {
  const [preset, setPreset] = React.useState<string>("Square");
  const [isCustom, setIsCustom] = React.useState(false);

  const updateConfig = (updates: Partial<FrameConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const handlePresetChange = (value: string) => {
    if (value === "Custom") {
      setIsCustom(true);
      return;
    }

    setIsCustom(false);
    setPreset(value);
    const selectedPreset = FRAME_PRESETS.find((p) => p.name === value);
    if (selectedPreset) {
      updateConfig({
        width: selectedPreset.width,
        height: selectedPreset.height,
      });
    }
  };

  // Sync preset when dimensions change externally
  React.useEffect(() => {
    const matchingPreset = FRAME_PRESETS.find(
      (p) => p.width === config.width && p.height === config.height
    );
    if (matchingPreset) {
      setPreset(matchingPreset.name);
      setIsCustom(false);
    } else {
      setIsCustom(true);
    }
  }, [config.width, config.height]);

  return (
    <Card className={cn("w-full border-border/50 sticky top-24", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Frame Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="space-y-6">
          {/* Frame Size and Fit Mode */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Frame Size</FieldLabel>
              <FieldContent>
                <Select
                  value={isCustom ? "Custom" : preset}
                  onValueChange={handlePresetChange}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FRAME_PRESETS.map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name} ({p.width} × {p.height})
                      </SelectItem>
                    ))}
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {isCustom && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <Label
                        htmlFor="width"
                        className="text-xs text-muted-foreground"
                      >
                        Width
                      </Label>
                      <Input
                        id="width"
                        type="number"
                        min="1"
                        max="10000"
                        value={config.width}
                        onChange={(e) =>
                          updateConfig({ width: parseInt(e.target.value) || 1 })
                        }
                        disabled={disabled}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="height"
                        className="text-xs text-muted-foreground"
                      >
                        Height
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        min="1"
                        max="10000"
                        value={config.height}
                        onChange={(e) =>
                          updateConfig({ height: parseInt(e.target.value) || 1 })
                        }
                        disabled={disabled}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Current: {config.width} × {config.height}px
                </p>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Fit Mode</FieldLabel>
              <FieldContent>
                <Select
                  value={config.fit}
                  onValueChange={(value) =>
                    updateConfig({ fit: value as FitMode })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="cover">Cover</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {config.fit === "contain"
                    ? "Image fits within frame"
                    : "Image covers entire frame"}
                </p>
              </FieldContent>
            </Field>
          </div>

          {/* Background Color/Gradient */}
          <Field>
            <FieldLabel>Background</FieldLabel>
            <FieldContent>
              <div className="space-y-3">
                <Select
                  value={config.backgroundType}
                  onValueChange={(value) =>
                    updateConfig({ backgroundType: value as BackgroundType })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                  </SelectContent>
                </Select>

                {config.backgroundType === 'solid' ? (
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.background}
                      onChange={(e) =>
                        updateConfig({ background: e.target.value })
                      }
                      disabled={disabled}
                      className="h-9 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={config.background}
                      onChange={(e) =>
                        updateConfig({ background: e.target.value })
                      }
                      disabled={disabled}
                      placeholder="#ffffff"
                      pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Start Color
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={config.backgroundGradientStart}
                            onChange={(e) =>
                              updateConfig({ backgroundGradientStart: e.target.value })
                            }
                            disabled={disabled}
                            className="h-9 w-16 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={config.backgroundGradientStart}
                            onChange={(e) =>
                              updateConfig({ backgroundGradientStart: e.target.value })
                            }
                            disabled={disabled}
                            placeholder="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          End Color
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={config.backgroundGradientEnd}
                            onChange={(e) =>
                              updateConfig({ backgroundGradientEnd: e.target.value })
                            }
                            disabled={disabled}
                            className="h-9 w-16 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={config.backgroundGradientEnd}
                            onChange={(e) =>
                              updateConfig({ backgroundGradientEnd: e.target.value })
                            }
                            disabled={disabled}
                            placeholder="#f0f0f0"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Direction
                      </Label>
                      <Select
                        value={config.backgroundGradientDirection}
                        onValueChange={(value) =>
                          updateConfig({ backgroundGradientDirection: value as 'horizontal' | 'vertical' | 'diagonal' })
                        }
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="horizontal">Horizontal</SelectItem>
                          <SelectItem value="vertical">Vertical</SelectItem>
                          <SelectItem value="diagonal">Diagonal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </FieldContent>
          </Field>

          {/* Padding and Border Radius */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Padding: {config.padding}px</FieldLabel>
              <FieldContent>
                <Slider
                  min={0}
                  max={100}
                  value={[config.padding]}
                  onValueChange={(value) => updateConfig({ padding: value[0] })}
                  disabled={disabled}
                  className="w-full"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Border Radius: {config.borderRadius}px</FieldLabel>
              <FieldContent>
                <Slider
                  min={0}
                  max={50}
                  value={[config.borderRadius]}
                  onValueChange={(value) =>
                    updateConfig({ borderRadius: value[0] })
                  }
                  disabled={disabled}
                  className="w-full"
                />
              </FieldContent>
            </Field>
          </div>

          {/* Shadow and Border Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <Field orientation="horizontal">
              <FieldContent className="flex-none">
                <Switch
                  id="shadow"
                  checked={config.shadow}
                  onCheckedChange={(checked) => updateConfig({ shadow: checked })}
                  disabled={disabled}
                />
              </FieldContent>
              <FieldLabel htmlFor="shadow">Shadow</FieldLabel>
            </Field>

            <Field orientation="horizontal">
              <FieldContent className="flex-none">
                <Switch
                  id="border"
                  checked={config.border}
                  onCheckedChange={(checked) => updateConfig({ border: checked })}
                  disabled={disabled}
                />
              </FieldContent>
              <FieldLabel htmlFor="border">Border</FieldLabel>
            </Field>
          </div>

          {/* Shadow Spread and Border Width */}
          {config.shadow && config.border && (
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Shadow Spread: {config.shadowSpread}px</FieldLabel>
                <FieldContent>
                  <Slider
                    min={0}
                    max={100}
                    value={[config.shadowSpread]}
                    onValueChange={(value) =>
                      updateConfig({ shadowSpread: value[0] })
                    }
                    disabled={disabled}
                    className="w-full"
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Border Width: {config.borderWidth}px</FieldLabel>
                <FieldContent>
                  <Slider
                    min={1}
                    max={20}
                    value={[config.borderWidth]}
                    onValueChange={(value) =>
                      updateConfig({ borderWidth: value[0] })
                    }
                    disabled={disabled}
                    className="w-full"
                  />
                </FieldContent>
              </Field>
            </div>
          )}
          {config.shadow && !config.border && (
            <Field>
              <FieldLabel>Shadow Spread: {config.shadowSpread}px</FieldLabel>
              <FieldContent>
                <Slider
                  min={0}
                  max={100}
                  value={[config.shadowSpread]}
                  onValueChange={(value) =>
                    updateConfig({ shadowSpread: value[0] })
                  }
                  disabled={disabled}
                  className="w-full"
                />
              </FieldContent>
            </Field>
          )}
          {!config.shadow && config.border && (
            <Field>
              <FieldLabel>Border Width: {config.borderWidth}px</FieldLabel>
              <FieldContent>
                <Slider
                  min={1}
                  max={20}
                  value={[config.borderWidth]}
                  onValueChange={(value) =>
                    updateConfig({ borderWidth: value[0] })
                  }
                  disabled={disabled}
                  className="w-full"
                />
              </FieldContent>
            </Field>
          )}

          {/* Border Style and Border Color */}
          {config.border && (
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Border Style</FieldLabel>
                <FieldContent>
                  <Select
                    value={config.borderStyle}
                    onValueChange={(value) =>
                      updateConfig({ borderStyle: value as BorderStyle })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                      <SelectItem value="dotted">Dotted</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>Border Color</FieldLabel>
                <FieldContent>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.borderColor}
                      onChange={(e) =>
                        updateConfig({ borderColor: e.target.value })
                      }
                      disabled={disabled}
                      className="h-9 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={config.borderColor}
                      onChange={(e) =>
                        updateConfig({ borderColor: e.target.value })
                      }
                      disabled={disabled}
                      placeholder="#000000"
                      pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    />
                  </div>
                </FieldContent>
              </Field>
            </div>
          )}

        </FieldGroup>
      </CardContent>
    </Card>
  );
}
