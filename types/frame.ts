export type FitMode = 'contain' | 'cover'

export type ExportFormat = 'png' | 'jpg'

export interface FrameConfig {
  width: number
  height: number
  background: string
  padding: number
  fit: FitMode
  borderRadius: number
  shadow: boolean
  shadowSpread: number
  format: ExportFormat
}

export interface FramePreset {
  name: string
  width: number
  height: number
}

export const FRAME_PRESETS: FramePreset[] = [
  { name: 'Square', width: 1080, height: 1080 },
  { name: 'Portrait', width: 1080, height: 1350 },
  { name: 'Landscape', width: 1080, height: 566 },
]

export const DEFAULT_FRAME_CONFIG: FrameConfig = {
  width: 1080,
  height: 1080,
  background: '#ffffff',
  padding: 0,
  fit: 'contain',
  borderRadius: 0,
  shadow: false,
  shadowSpread: 20,
  format: 'png',
}
