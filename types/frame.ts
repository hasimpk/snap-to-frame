export type FitMode = 'contain' | 'cover'

export type ExportFormat = 'png' | 'jpg'

export type BorderStyle = 'solid' | 'dashed' | 'dotted'

export type BackgroundType = 'solid' | 'gradient'

export interface FrameConfig {
  width: number
  height: number
  background: string
  backgroundType: BackgroundType
  backgroundGradientStart: string
  backgroundGradientEnd: string
  backgroundGradientDirection: 'horizontal' | 'vertical' | 'diagonal'
  padding: number
  fit: FitMode
  borderRadius: number
  shadow: boolean
  shadowSpread: number
  border: boolean
  borderColor: string
  borderWidth: number
  borderStyle: BorderStyle
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
  backgroundType: 'solid',
  backgroundGradientStart: '#ffffff',
  backgroundGradientEnd: '#f0f0f0',
  backgroundGradientDirection: 'vertical',
  padding: 0,
  fit: 'contain',
  borderRadius: 0,
  shadow: false,
  shadowSpread: 20,
  border: false,
  borderColor: '#000000',
  borderWidth: 2,
  borderStyle: 'solid',
  format: 'png',
}
