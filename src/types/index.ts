export interface CSSProperty {
  property: string
  value: string
  important?: boolean
}

export interface ElementStyles {
  selector: string
  properties: CSSProperty[]
}

export interface SelectedElement {
  element: HTMLElement
  selector: string
  computedStyles: Record<string, string>
  boundingRect: DOMRect
}

export interface StyleRule {
  selector: string
  styles: Record<string, string>
}

export interface Project {
  id: string
  name: string
  html: string
  css: string
  styles: StyleRule[]
  createdAt: Date
  updatedAt: Date
}

export interface EditorState {
  selectedElement: SelectedElement | null
  hoveredElement: HTMLElement | null
  isBoxModelVisible: boolean
  isDragging: boolean
  zoom: number
  showGrid: boolean
}

export interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
}

export interface SliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  unit?: string
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label?: string
}

export interface FontFamily {
  name: string
  value: string
  category: 'serif' | 'sans-serif' | 'monospace' | 'cursive' | 'fantasy'
}

export interface CSSUnit {
  name: string
  value: string
  type: 'absolute' | 'relative' | 'percentage'
}

export interface HistoryState {
  styles: StyleRule[]
  selectedElement: SelectedElement | null
  timestamp: number
}

export interface ExportOptions {
  format: 'css' | 'json'
  minify?: boolean
  includeComments?: boolean
  filename?: string
}