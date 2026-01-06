'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldContent } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { FrameConfig, FitMode, ExportFormat } from '@/types/frame'
import { FRAME_PRESETS } from '@/types/frame'
import { cn } from '@/lib/utils'

export interface FrameControlsProps {
  config: FrameConfig
  onConfigChange: (config: FrameConfig) => void
  disabled?: boolean
  className?: string
}

export function FrameControls({
  config,
  onConfigChange,
  disabled = false,
  className,
}: FrameControlsProps) {
  const [preset, setPreset] = React.useState<string>('Square')
  const [isCustom, setIsCustom] = React.useState(false)

  const updateConfig = (updates: Partial<FrameConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  const handlePresetChange = (value: string) => {
    if (value === 'Custom') {
      setIsCustom(true)
      return
    }

    setIsCustom(false)
    setPreset(value)
    const selectedPreset = FRAME_PRESETS.find((p) => p.name === value)
    if (selectedPreset) {
      updateConfig({
        width: selectedPreset.width,
        height: selectedPreset.height,
      })
    }
  }

  // Sync preset when dimensions change externally
  React.useEffect(() => {
    const matchingPreset = FRAME_PRESETS.find(
      (p) => p.width === config.width && p.height === config.height
    )
    if (matchingPreset) {
      setPreset(matchingPreset.name)
      setIsCustom(false)
    } else {
      setIsCustom(true)
    }
  }, [config.width, config.height])

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Frame Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          {/* Frame Size */}
          <Field>
            <FieldLabel>Frame Size</FieldLabel>
            <FieldContent>
              <Select
                value={isCustom ? 'Custom' : preset}
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
                    <Label htmlFor="width" className="text-xs text-muted-foreground">
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
                    <Label htmlFor="height" className="text-xs text-muted-foreground">
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

          {/* Fit Mode */}
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="cover">Cover</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {config.fit === 'contain'
                  ? 'Image fits within frame'
                  : 'Image covers entire frame'}
              </p>
            </FieldContent>
          </Field>

          {/* Background Color */}
          <Field>
            <FieldLabel>Background Color</FieldLabel>
            <FieldContent>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.background}
                  onChange={(e) => updateConfig({ background: e.target.value })}
                  disabled={disabled}
                  className="h-9 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={config.background}
                  onChange={(e) => updateConfig({ background: e.target.value })}
                  disabled={disabled}
                  placeholder="#ffffff"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
              </div>
            </FieldContent>
          </Field>

          {/* Padding */}
          <Field>
            <FieldLabel>
              Padding: {config.padding}px
            </FieldLabel>
            <FieldContent>
              <Input
                type="range"
                min="0"
                max="100"
                value={config.padding}
                onChange={(e) =>
                  updateConfig({ padding: parseInt(e.target.value) })
                }
                disabled={disabled}
                className="w-full"
              />
            </FieldContent>
          </Field>

          {/* Border Radius */}
          <Field>
            <FieldLabel>
              Border Radius: {config.borderRadius}px
            </FieldLabel>
            <FieldContent>
              <Input
                type="range"
                min="0"
                max="50"
                value={config.borderRadius}
                onChange={(e) =>
                  updateConfig({ borderRadius: parseInt(e.target.value) })
                }
                disabled={disabled}
                className="w-full"
              />
            </FieldContent>
          </Field>

          {/* Shadow */}
          <Field orientation="horizontal">
            <FieldLabel htmlFor="shadow">Shadow</FieldLabel>
            <FieldContent>
              <input
                id="shadow"
                type="checkbox"
                checked={config.shadow}
                onChange={(e) => updateConfig({ shadow: e.target.checked })}
                disabled={disabled}
                className="h-4 w-4 rounded border-input accent-primary"
              />
            </FieldContent>
          </Field>

          {/* Format */}
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
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
