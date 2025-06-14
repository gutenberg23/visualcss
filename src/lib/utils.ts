import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`
  }
  
  if (element.className) {
    const classes = element.className.split(' ').filter(cls => cls.trim())
    if (classes.length > 0) {
      return `.${classes.join('.')}`
    }
  }
  
  const tagName = element.tagName.toLowerCase()
  const parent = element.parentElement
  
  if (!parent) {
    return tagName
  }
  
  const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName)
  const index = siblings.indexOf(element)
  
  if (siblings.length > 1) {
    return `${generateSelector(parent)} > ${tagName}:nth-child(${index + 1})`
  }
  
  return `${generateSelector(parent)} > ${tagName}`
}

export function getComputedStyles(element: HTMLElement) {
  const computed = window.getComputedStyle(element)
  return {
    color: computed.color,
    backgroundColor: computed.backgroundColor,
    fontSize: computed.fontSize,
    fontFamily: computed.fontFamily,
    fontWeight: computed.fontWeight,
    lineHeight: computed.lineHeight,
    textAlign: computed.textAlign,
    margin: computed.margin,
    marginTop: computed.marginTop,
    marginRight: computed.marginRight,
    marginBottom: computed.marginBottom,
    marginLeft: computed.marginLeft,
    padding: computed.padding,
    paddingTop: computed.paddingTop,
    paddingRight: computed.paddingRight,
    paddingBottom: computed.paddingBottom,
    paddingLeft: computed.paddingLeft,
    border: computed.border,
    borderColor: computed.borderColor,
    borderWidth: computed.borderWidth,
    borderRadius: computed.borderRadius,
    width: computed.width,
    height: computed.height,
    display: computed.display,
    position: computed.position,
    top: computed.top,
    right: computed.right,
    bottom: computed.bottom,
    left: computed.left,
    zIndex: computed.zIndex,
    opacity: computed.opacity,
    transform: computed.transform,
    boxShadow: computed.boxShadow
  }
}

export function rgbToHex(rgb: string): string {
  const result = rgb.match(/\d+/g)
  if (!result || result.length < 3) return '#000000'
  
  const r = parseInt(result[0])
  const g = parseInt(result[1])
  const b = parseInt(result[2])
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function parsePixelValue(value: string): number {
  return parseFloat(value.replace('px', '')) || 0
}

export function formatPixelValue(value: number): string {
  return `${value}px`
}