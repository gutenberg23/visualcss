import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { EditorState, SelectedElement, StyleRule, HistoryState } from '../types'

interface EditorContextType {
  state: EditorState
  styles: StyleRule[]
  history: HistoryState[]
  historyIndex: number
  selectElement: (element: HTMLElement | null) => void
  updateStyle: (selector: string, property: string, value: string) => void
  toggleBoxModel: () => void
  setZoom: (zoom: number) => void
  toggleGrid: () => void
  undo: () => void
  redo: () => void
  exportStyles: (format: 'css' | 'json') => string
  importStyles: (data: string, format: 'css' | 'json') => void
  clearStyles: () => void
}

type EditorAction =
  | { type: 'SELECT_ELEMENT'; payload: SelectedElement | null }
  | { type: 'UPDATE_STYLE'; payload: { selector: string; property: string; value: string } }
  | { type: 'TOGGLE_BOX_MODEL' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_STYLES'; payload: StyleRule[] }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_STYLES' }

interface EditorProviderState {
  editorState: EditorState
  styles: StyleRule[]
  history: HistoryState[]
  historyIndex: number
}

const initialState: EditorProviderState = {
  editorState: {
    selectedElement: null,
    hoveredElement: null,
    isBoxModelVisible: false,
    isDragging: false,
    zoom: 1,
    showGrid: false
  },
  styles: [],
  history: [],
  historyIndex: -1
}

function editorReducer(state: EditorProviderState, action: EditorAction): EditorProviderState {
  switch (action.type) {
    case 'SELECT_ELEMENT':
      return {
        ...state,
        editorState: {
          ...state.editorState,
          selectedElement: action.payload
        }
      }
    
    case 'UPDATE_STYLE': {
      const { selector, property, value } = action.payload
      const existingRuleIndex = state.styles.findIndex(rule => rule.selector === selector)
      
      let newStyles: StyleRule[]
      if (existingRuleIndex >= 0) {
        newStyles = [...state.styles]
        newStyles[existingRuleIndex] = {
          ...newStyles[existingRuleIndex],
          styles: {
            ...newStyles[existingRuleIndex].styles,
            [property]: value
          }
        }
      } else {
        newStyles = [
          ...state.styles,
          {
            selector,
            styles: { [property]: value }
          }
        ]
      }
      
      // Add to history
      const newHistoryState: HistoryState = {
        styles: newStyles,
        selectedElement: state.editorState.selectedElement,
        timestamp: Date.now()
      }
      
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(newHistoryState)
      
      // Limit history to 50 entries
      if (newHistory.length > 50) {
        newHistory.shift()
      }
      
      return {
        ...state,
        styles: newStyles,
        history: newHistory,
        historyIndex: newHistory.length - 1
      }
    }
    
    case 'TOGGLE_BOX_MODEL':
      return {
        ...state,
        editorState: {
          ...state.editorState,
          isBoxModelVisible: !state.editorState.isBoxModelVisible
        }
      }
    
    case 'SET_ZOOM':
      return {
        ...state,
        editorState: {
          ...state.editorState,
          zoom: action.payload
        }
      }
    
    case 'TOGGLE_GRID':
      return {
        ...state,
        editorState: {
          ...state.editorState,
          showGrid: !state.editorState.showGrid
        }
      }
    
    case 'SET_STYLES':
      return {
        ...state,
        styles: action.payload
      }
    
    case 'UNDO': {
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1]
        return {
          ...state,
          styles: previousState.styles,
          editorState: {
            ...state.editorState,
            selectedElement: previousState.selectedElement
          },
          historyIndex: state.historyIndex - 1
        }
      }
      return state
    }
    
    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1]
        return {
          ...state,
          styles: nextState.styles,
          editorState: {
            ...state.editorState,
            selectedElement: nextState.selectedElement
          },
          historyIndex: state.historyIndex + 1
        }
      }
      return state
    }
    
    case 'CLEAR_STYLES':
      return {
        ...state,
        styles: [],
        history: [],
        historyIndex: -1
      }
    
    default:
      return state
  }
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  
  const selectElement = (element: HTMLElement | null) => {
    if (!element) {
      dispatch({ type: 'SELECT_ELEMENT', payload: null })
      return
    }
    
    const selector = generateSelector(element)
    const computedStyles = getComputedStyles(element)
    const boundingRect = element.getBoundingClientRect()
    
    dispatch({
      type: 'SELECT_ELEMENT',
      payload: {
        element,
        selector,
        computedStyles,
        boundingRect
      }
    })
  }
  
  const updateStyle = (selector: string, property: string, value: string) => {
    dispatch({ type: 'UPDATE_STYLE', payload: { selector, property, value } })
  }
  
  const toggleBoxModel = () => {
    dispatch({ type: 'TOGGLE_BOX_MODEL' })
  }
  
  const setZoom = (zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom })
  }
  
  const toggleGrid = () => {
    dispatch({ type: 'TOGGLE_GRID' })
  }
  
  const undo = () => {
    dispatch({ type: 'UNDO' })
  }
  
  const redo = () => {
    dispatch({ type: 'REDO' })
  }
  
  const exportStyles = (format: 'css' | 'json'): string => {
    if (format === 'css') {
      return state.styles
        .map(rule => {
          const styles = Object.entries(rule.styles)
            .map(([prop, value]) => `  ${prop}: ${value};`)
            .join('\n')
          return `${rule.selector} {\n${styles}\n}`
        })
        .join('\n\n')
    } else {
      return JSON.stringify(state.styles, null, 2)
    }
  }
  
  const importStyles = (data: string, format: 'css' | 'json') => {
    try {
      if (format === 'json') {
        const styles = JSON.parse(data) as StyleRule[]
        dispatch({ type: 'SET_STYLES', payload: styles })
      } else {
        // Basic CSS parsing - in a real app, you'd want a proper CSS parser
        const rules = data.split('}').filter(rule => rule.trim())
        const styles: StyleRule[] = rules.map(rule => {
          const [selector, styleBlock] = rule.split('{')
          const styles: Record<string, string> = {}
          
          if (styleBlock) {
            styleBlock.split(';').forEach(declaration => {
              const [prop, value] = declaration.split(':')
              if (prop && value) {
                styles[prop.trim()] = value.trim()
              }
            })
          }
          
          return {
            selector: selector.trim(),
            styles
          }
        })
        
        dispatch({ type: 'SET_STYLES', payload: styles })
      }
    } catch (error) {
      console.error('Failed to import styles:', error)
    }
  }
  
  const clearStyles = () => {
    dispatch({ type: 'CLEAR_STYLES' })
  }
  
  const value: EditorContextType = {
    state: state.editorState,
    styles: state.styles,
    history: state.history,
    historyIndex: state.historyIndex,
    selectElement,
    updateStyle,
    toggleBoxModel,
    setZoom,
    toggleGrid,
    undo,
    redo,
    exportStyles,
    importStyles,
    clearStyles
  }
  
  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}

// Helper functions
function generateSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`
  }
  
  if (element.className) {
    const classes = element.className.split(' ').filter(cls => cls.trim() && !cls.startsWith('element-'))
    if (classes.length > 0) {
      return `.${classes.join('.')}`
    }
  }
  
  const tagName = element.tagName.toLowerCase()
  const parent = element.parentElement
  
  if (!parent || parent.tagName === 'BODY') {
    return tagName
  }
  
  const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName)
  const index = siblings.indexOf(element)
  
  if (siblings.length > 1) {
    return `${generateSelector(parent)} > ${tagName}:nth-child(${index + 1})`
  }
  
  return `${generateSelector(parent)} > ${tagName}`
}

function getComputedStyles(element: HTMLElement): Record<string, string> {
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