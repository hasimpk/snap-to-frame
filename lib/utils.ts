import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates if a string is a valid CSS color value
 * @param color - The color string to validate
 * @returns true if valid, false otherwise
 */
export function isValidColor(color: string): boolean {
  if (!color || typeof color !== 'string') {
    return false
  }
  
  // Create a temporary canvas element to test color parsing
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return false
  }
  
  try {
    ctx.fillStyle = color
    // If fillStyle equals the input, it's valid (unless it's an invalid hex)
    // Check for common invalid patterns
    if (color.startsWith('#')) {
      // Hex colors should be #RGB, #RRGGBB, or #RRGGBBAA
      const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/
      return hexPattern.test(color)
    }
    return ctx.fillStyle === color || ctx.fillStyle !== ''
  } catch {
    return false
  }
}

/**
 * Sanitizes a color value, returning a valid color or a fallback
 * @param color - The color string to sanitize
 * @param fallback - The fallback color if invalid (default: '#ffffff')
 * @returns A valid color string
 */
export function sanitizeColor(color: string, fallback: string = '#ffffff'): string {
  if (isValidColor(color)) {
    return color
  }
  return isValidColor(fallback) ? fallback : '#ffffff'
}

/**
 * Validates a color and throws a user-friendly error if invalid
 * @param color - The color string to validate
 * @param colorName - A descriptive name for the color (e.g., "gradient start color")
 * @throws Error with user-friendly message if color is invalid
 */
export function validateColorOrThrow(color: string, colorName: string = 'color'): void {
  if (!isValidColor(color)) {
    throw new Error(
      `Invalid ${colorName}: "${color}". Please enter a valid color value (e.g., #ffffff, rgb(255,255,255), or a named color like "red").`
    )
  }
}
