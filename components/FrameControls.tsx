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
import { ColorPicker } from "@/components/ui/color-picker";
import type {
  FrameConfig,
  FitMode,
  BorderStyle,
  BackgroundType,
} from "@/types/frame";
import { FRAME_PRESETS, FRAME_CONFIG_PRESETS } from "@/types/frame";
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
  const [configPreset, setConfigPreset] = React.useState<string | null>(null);
  const [isConfigCustom, setIsConfigCustom] = React.useState(true);

  const updateConfig = (updates: Partial<FrameConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  // Check if current config matches a preset (ignoring width/height)
  const checkConfigPreset = React.useCallback((currentConfig: FrameConfig) => {
    const configWithoutDimensions = {
      background: currentConfig.background,
      backgroundType: currentConfig.backgroundType,
      backgroundGradientStart: currentConfig.backgroundGradientStart,
      backgroundGradientEnd: currentConfig.backgroundGradientEnd,
      backgroundGradientDirection: currentConfig.backgroundGradientDirection,
      padding: currentConfig.padding,
      fit: currentConfig.fit,
      borderRadius: currentConfig.borderRadius,
      shadow: currentConfig.shadow,
      shadowSpread: currentConfig.shadowSpread,
      border: currentConfig.border,
      borderColor: currentConfig.borderColor,
      borderWidth: currentConfig.borderWidth,
      borderStyle: currentConfig.borderStyle,
      format: currentConfig.format,
    };

    const matchingPreset = FRAME_CONFIG_PRESETS.find((p) => {
      return Object.keys(configWithoutDimensions).every(
        (key) =>
          configWithoutDimensions[
            key as keyof typeof configWithoutDimensions
          ] === p.config[key as keyof typeof p.config]
      );
    });

    return matchingPreset;
  }, []);

  const handleConfigPresetChange = (value: string) => {
    if (value === "Custom") {
      setIsConfigCustom(true);
      setConfigPreset(null);
      return;
    }

    setIsConfigCustom(false);
    setConfigPreset(value);
    const selectedPreset = FRAME_CONFIG_PRESETS.find((p) => p.name === value);
    if (selectedPreset) {
      // Apply preset config while preserving current width/height
      updateConfig({
        ...selectedPreset.config,
        width: config.width,
        height: config.height,
      });
    }
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

  // Sync config preset when config changes externally
  // Note: We check all config properties except width/height to match presets
  React.useEffect(() => {
    const matchingPreset = checkConfigPreset(config);
    if (matchingPreset) {
      setConfigPreset(matchingPreset.name);
      setIsConfigCustom(false);
    } else {
      setIsConfigCustom(true);
      setConfigPreset(null);
    }
  }, [config, checkConfigPreset]);

  return (
    <Card className={cn("w-full border-border/50", className)}>
      <CardHeader>
        <CardTitle className="text-xl">Frame Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="">
          {/* Configuration Preset */}
          <Field>
            <FieldLabel>Style Preset</FieldLabel>
            <FieldContent>
              <Select
                value={isConfigCustom ? "Custom" : configPreset || "Custom"}
                onValueChange={handleConfigPresetChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRAME_CONFIG_PRESETS.map((p) => (
                    <SelectItem key={p.name} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {isConfigCustom
                  ? "Custom configuration"
                  : `Using ${configPreset} preset`}
              </p>
            </FieldContent>
          </Field>

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
                          updateConfig({
                            height: parseInt(e.target.value) || 1,
                          })
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

                {config.backgroundType === "solid" ? (
                  <ColorPicker
                    value={config.background}
                    onChange={(value) => updateConfig({ background: value })}
                    disabled={disabled}
                    placeholder="#ffffff"
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Direction
                        </Label>
                        <Select
                          value={config.backgroundGradientDirection}
                          onValueChange={(value) =>
                            updateConfig({
                              backgroundGradientDirection: value as
                                | "horizontal"
                                | "vertical"
                                | "diagonal",
                            })
                          }
                          disabled={disabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="horizontal">
                              Horizontal
                            </SelectItem>
                            <SelectItem value="vertical">Vertical</SelectItem>
                            <SelectItem value="diagonal">Diagonal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Start Color
                        </Label>
                        <ColorPicker
                          value={config.backgroundGradientStart}
                          onChange={(value) =>
                            updateConfig({
                              backgroundGradientStart: value,
                            })
                          }
                          disabled={disabled}
                          placeholder="#ffffff"
                          colorInputClassName="h-9 w-16 cursor-pointer"
                          textInputClassName="flex-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          End Color
                        </Label>
                        <ColorPicker
                          value={config.backgroundGradientEnd}
                          onChange={(value) =>
                            updateConfig({
                              backgroundGradientEnd: value,
                            })
                          }
                          disabled={disabled}
                          placeholder="#f0f0f0"
                          colorInputClassName="h-9 w-16 cursor-pointer"
                          textInputClassName="flex-1"
                        />
                      </div>
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
                  onCheckedChange={(checked) =>
                    updateConfig({ shadow: checked })
                  }
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
                  onCheckedChange={(checked) =>
                    updateConfig({ border: checked })
                  }
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
                  <ColorPicker
                    value={config.borderColor}
                    onChange={(value) => updateConfig({ borderColor: value })}
                    disabled={disabled}
                    placeholder="#000000"
                  />
                </FieldContent>
              </Field>
            </div>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
