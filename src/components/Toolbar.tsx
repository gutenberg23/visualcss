import { useEditor } from '../context/EditorContext'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Slider } from './ui/slider'
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  Trash2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Eye,
  Code
} from 'lucide-react'
import { cn } from '../lib/utils'

interface ToolbarProps {
  className?: string
  onExport?: () => void
  onImport?: () => void
  onCodeView?: () => void
  showCodeView?: boolean
}

export function Toolbar({ className, onExport, onImport, onCodeView }: ToolbarProps) {
  const {
    state,
    history,
    historyIndex,
    undo,
    redo,
    clearStyles,
    setZoom,
    toggleGrid,
    toggleBoxModel
  } = useEditor()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0] / 100)
  }

  const zoomPercentage = Math.round(state.zoom * 100)

  const handleExport = () => {
    if (onExport) {
      onExport()
    } else {
      // Default export behavior
      const styles = useEditor().exportStyles('css')
      const blob = new Blob([styles], { type: 'text/css' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'styles.css'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleImport = () => {
    if (onImport) {
      onImport()
    } else {
      // Default import behavior
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.css,.json'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const content = e.target?.result as string
            const format = file.name.endsWith('.json') ? 'json' : 'css'
            useEditor().importStyles(content, format)
          }
          reader.readAsText(file)
        }
      }
      input.click()
    }
  }

  return (
    <div className={cn('flex items-center gap-2 p-4 bg-background border-b', className)}>
      {/* History Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 w-8 p-0"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 w-8 p-0"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(Math.max(0.25, state.zoom - 0.1))}
          className="h-8 w-8 p-0"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 min-w-[120px]">
          <Slider
            value={[zoomPercentage]}
            onValueChange={handleZoomChange}
            min={25}
            max={200}
            step={5}
            className="flex-1"
          />
          <Badge variant="secondary" className="text-xs min-w-[45px] justify-center">
            {zoomPercentage}%
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(Math.min(2, state.zoom + 0.1))}
          className="h-8 w-8 p-0"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* View Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant={state.showGrid ? "default" : "ghost"}
          size="sm"
          onClick={toggleGrid}
          className="h-8 w-8 p-0"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        
        <Button
          variant={state.isBoxModelVisible ? "default" : "ghost"}
          size="sm"
          onClick={toggleBoxModel}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* File Operations */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImport}
          className="h-8 px-3"
        >
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="h-8 px-3"
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Code View */}
      {onCodeView && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCodeView}
            className="h-8 px-3"
          >
            <Code className="h-4 w-4 mr-1" />
            Code
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Clear Styles */}
      <Button
        variant="ghost"
        size="sm"
        onClick={clearStyles}
        className="h-8 px-3 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Clear
      </Button>

      {/* Status */}
      <div className="ml-auto flex items-center gap-2">
        {state.selectedElement && (
          <Badge variant="outline" className="text-xs">
            Selected: {state.selectedElement.selector}
          </Badge>
        )}
        
        <Badge variant="secondary" className="text-xs">
          {history.length} {history.length === 1 ? 'change' : 'changes'}
        </Badge>
      </div>
    </div>
  )
}