import React from 'react'
import { useEditor } from '../context/EditorContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ColorPicker } from './ui/color-picker'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { rgbToHex, parsePixelValue, formatPixelValue } from '../lib/utils'
import { Palette, Type, Box, Layout, Zap } from 'lucide-react'

interface StylePanelProps {
  className?: string
}

export function StylePanel({ className }: StylePanelProps) {
  const { state, updateStyle } = useEditor()
  const selectedElement = state.selectedElement

  if (!selectedElement) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Style Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Select an element to start editing its styles
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleStyleUpdate = (property: string, value: string) => {
    updateStyle(selectedElement.selector, property, value)
  }

  const getColorValue = (property: string): string => {
    const value = selectedElement.computedStyles[property] || '#000000'
    if (value.startsWith('rgb')) {
      return rgbToHex(value)
    }
    return value.startsWith('#') ? value : '#000000'
  }

  const getPixelValue = (property: string): number => {
    return parsePixelValue(selectedElement.computedStyles[property] || '0px')
  }

  const fontFamilies = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'system-ui, sans-serif', label: 'System UI' },
  ]

  const displayOptions = [
    { value: 'block', label: 'Block' },
    { value: 'inline', label: 'Inline' },
    { value: 'inline-block', label: 'Inline Block' },
    { value: 'flex', label: 'Flex' },
    { value: 'grid', label: 'Grid' },
    { value: 'none', label: 'None' },
  ]

  const positionOptions = [
    { value: 'static', label: 'Static' },
    { value: 'relative', label: 'Relative' },
    { value: 'absolute', label: 'Absolute' },
    { value: 'fixed', label: 'Fixed' },
    { value: 'sticky', label: 'Sticky' },
  ]

  const textAlignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
    { value: 'justify', label: 'Justify' },
  ]

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Style Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedElement.selector}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors" className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="typography" className="flex items-center gap-1">
                <Type className="h-3 w-3" />
                Text
              </TabsTrigger>
              <TabsTrigger value="spacing" className="flex items-center gap-1">
                <Box className="h-3 w-3" />
                Box
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-1">
                <Layout className="h-3 w-3" />
                Layout
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <div className="space-y-4">
                <ColorPicker
                  label="Text Color"
                  color={getColorValue('color')}
                  onChange={(color) => handleStyleUpdate('color', color)}
                />
                
                <ColorPicker
                  label="Background Color"
                  color={getColorValue('backgroundColor')}
                  onChange={(color) => handleStyleUpdate('background-color', color)}
                />
                
                <ColorPicker
                  label="Border Color"
                  color={getColorValue('borderColor')}
                  onChange={(color) => handleStyleUpdate('border-color', color)}
                />
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={selectedElement.computedStyles.fontFamily || 'Arial, sans-serif'}
                    onValueChange={(value) => handleStyleUpdate('font-family', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[getPixelValue('fontSize')]}
                      onValueChange={([value]) => handleStyleUpdate('font-size', formatPixelValue(value))}
                      min={8}
                      max={72}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={getPixelValue('fontSize')}
                      onChange={(e) => handleStyleUpdate('font-size', formatPixelValue(Number(e.target.value)))}
                      className="w-20"
                      min={8}
                      max={72}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select
                    value={selectedElement.computedStyles.fontWeight || '400'}
                    onValueChange={(value) => handleStyleUpdate('font-weight', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">Thin (100)</SelectItem>
                      <SelectItem value="200">Extra Light (200)</SelectItem>
                      <SelectItem value="300">Light (300)</SelectItem>
                      <SelectItem value="400">Normal (400)</SelectItem>
                      <SelectItem value="500">Medium (500)</SelectItem>
                      <SelectItem value="600">Semi Bold (600)</SelectItem>
                      <SelectItem value="700">Bold (700)</SelectItem>
                      <SelectItem value="800">Extra Bold (800)</SelectItem>
                      <SelectItem value="900">Black (900)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Text Align</Label>
                  <Select
                    value={selectedElement.computedStyles.textAlign || 'left'}
                    onValueChange={(value) => handleStyleUpdate('text-align', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {textAlignOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Margin</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Top</Label>
                      <Input
                        type="number"
                        value={getPixelValue('marginTop')}
                        onChange={(e) => handleStyleUpdate('margin-top', formatPixelValue(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Right</Label>
                      <Input
                        type="number"
                        value={getPixelValue('marginRight')}
                        onChange={(e) => handleStyleUpdate('margin-right', formatPixelValue(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Bottom</Label>
                      <Input
                        type="number"
                        value={getPixelValue('marginBottom')}
                        onChange={(e) => handleStyleUpdate('margin-bottom', formatPixelValue(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Left</Label>
                      <Input
                        type="number"
                        value={getPixelValue('marginLeft')}
                        onChange={(e) => handleStyleUpdate('margin-left', formatPixelValue(Number(e.target.value)))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Padding</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Top</Label>
                      <Input
                        type="number"
                        value={getPixelValue('paddingTop')}
                        onChange={(e) => handleStyleUpdate('padding-top', formatPixelValue(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Right</Label>
                      <Input
                        type="number"
                        value={getPixelValue('paddingRight')}
                        onChange={(e) => handleStyleUpdate('padding-right', formatPixelValue(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Bottom</Label>
                      <Input
                        type="number"
                        value={getPixelValue('paddingBottom')}
                        onChange={(e) => handleStyleUpdate('padding-bottom', formatPixelValue(Number(e.target.value)))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Left</Label>
                      <Input
                        type="number"
                        value={getPixelValue('paddingLeft')}
                        onChange={(e) => handleStyleUpdate('padding-left', formatPixelValue(Number(e.target.value)))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[getPixelValue('borderRadius')]}
                      onValueChange={([value]) => handleStyleUpdate('border-radius', formatPixelValue(value))}
                      min={0}
                      max={50}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={getPixelValue('borderRadius')}
                      onChange={(e) => handleStyleUpdate('border-radius', formatPixelValue(Number(e.target.value)))}
                      className="w-20"
                      min={0}
                      max={50}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Border Width</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[getPixelValue('borderWidth')]}
                      onValueChange={([value]) => handleStyleUpdate('border-width', formatPixelValue(value))}
                      min={0}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={getPixelValue('borderWidth')}
                      onChange={(e) => handleStyleUpdate('border-width', formatPixelValue(Number(e.target.value)))}
                      className="w-20"
                      min={0}
                      max={10}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Display</Label>
                  <Select
                    value={selectedElement.computedStyles.display || 'block'}
                    onValueChange={(value) => handleStyleUpdate('display', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {displayOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={selectedElement.computedStyles.position || 'static'}
                    onValueChange={(value) => handleStyleUpdate('position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Width</Label>
                  <Input
                    value={selectedElement.computedStyles.width || 'auto'}
                    onChange={(e) => handleStyleUpdate('width', e.target.value)}
                    placeholder="auto, 100px, 50%, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input
                    value={selectedElement.computedStyles.height || 'auto'}
                    onChange={(e) => handleStyleUpdate('height', e.target.value)}
                    placeholder="auto, 100px, 50%, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opacity</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      value={[parseFloat(selectedElement.computedStyles.opacity || '1') * 100]}
                      onValueChange={([value]) => handleStyleUpdate('opacity', (value / 100).toString())}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={Math.round(parseFloat(selectedElement.computedStyles.opacity || '1') * 100)}
                      onChange={(e) => handleStyleUpdate('opacity', (Number(e.target.value) / 100).toString())}
                      className="w-20"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}