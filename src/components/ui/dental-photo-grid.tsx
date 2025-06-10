'use client'

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Plus,
  Trash2,
  GripVertical,
  Grid3X3,
  LayoutGrid,
  Eye,
  Settings,
  Image,
  Move,
  Maximize2,
  Camera,
  CheckCircle,
  AlertTriangle,
  Info,
  Target,
  Layers
} from "lucide-react"

interface PhotoGridConfigProps {
  config: Record<string, any>
  onChange: (config: Record<string, any>) => void
}

interface PhotoSlot {
  id: string
  position: { row: number; col: number }
  photoType: string
  label: string
  isRequired: boolean
  size: 'small' | 'medium' | 'large'
  instructions?: string
}

// Grid layout templates
const gridTemplates = [
  {
    id: "basic_3x2",
    name: "Basic 3×2 Grid",
    description: "Six photo layout for standard dental assessment",
    dimensions: { rows: 2, cols: 3 },
    slots: [
      { id: "1", position: { row: 0, col: 0 }, photoType: "front_smile", label: "Front Smile", isRequired: true, size: "medium" },
      { id: "2", position: { row: 0, col: 1 }, photoType: "side_profile_right", label: "Right Profile", isRequired: true, size: "medium" },
      { id: "3", position: { row: 0, col: 2 }, photoType: "side_profile_left", label: "Left Profile", isRequired: true, size: "medium" },
      { id: "4", position: { row: 1, col: 0 }, photoType: "upper_arch", label: "Upper Arch", isRequired: true, size: "medium" },
      { id: "5", position: { row: 1, col: 1 }, photoType: "lower_arch", label: "Lower Arch", isRequired: true, size: "medium" },
      { id: "6", position: { row: 1, col: 2 }, photoType: "bite_front", label: "Front Bite", isRequired: false, size: "medium" }
    ]
  },
  {
    id: "orthodontic_4x2",
    name: "Orthodontic 4×2 Grid",
    description: "Eight photo layout for orthodontic evaluation",
    dimensions: { rows: 2, cols: 4 },
    slots: [
      { id: "1", position: { row: 0, col: 0 }, photoType: "front_smile", label: "Front Smile", isRequired: true, size: "medium" },
      { id: "2", position: { row: 0, col: 1 }, photoType: "retracted_smile", label: "Retracted", isRequired: true, size: "medium" },
      { id: "3", position: { row: 0, col: 2 }, photoType: "side_profile_right", label: "Right Profile", isRequired: true, size: "medium" },
      { id: "4", position: { row: 0, col: 3 }, photoType: "side_profile_left", label: "Left Profile", isRequired: true, size: "medium" },
      { id: "5", position: { row: 1, col: 0 }, photoType: "upper_arch", label: "Upper Arch", isRequired: true, size: "medium" },
      { id: "6", position: { row: 1, col: 1 }, photoType: "lower_arch", label: "Lower Arch", isRequired: true, size: "medium" },
      { id: "7", position: { row: 1, col: 2 }, photoType: "bite_front", label: "Front Bite", isRequired: true, size: "medium" },
      { id: "8", position: { row: 1, col: 3 }, photoType: "bite_side", label: "Side Bite", isRequired: false, size: "medium" }
    ]
  },
  {
    id: "implant_planning",
    name: "Implant Planning Layout",
    description: "Specialized layout for implant treatment planning",
    dimensions: { rows: 3, cols: 3 },
    slots: [
      { id: "1", position: { row: 0, col: 0 }, photoType: "front_smile", label: "Front Smile", isRequired: true, size: "large" },
      { id: "2", position: { row: 0, col: 1 }, photoType: "side_profile_right", label: "Right Profile", isRequired: true, size: "medium" },
      { id: "3", position: { row: 0, col: 2 }, photoType: "side_profile_left", label: "Left Profile", isRequired: true, size: "medium" },
      { id: "4", position: { row: 1, col: 0 }, photoType: "upper_arch", label: "Upper Arch", isRequired: true, size: "large" },
      { id: "5", position: { row: 1, col: 1 }, photoType: "lower_arch", label: "Lower Arch", isRequired: true, size: "large" },
      { id: "6", position: { row: 1, col: 2 }, photoType: "bite_front", label: "Front Bite", isRequired: true, size: "medium" },
      { id: "7", position: { row: 2, col: 0 }, photoType: "x_ray", label: "Panoramic X-Ray", isRequired: true, size: "large" },
      { id: "8", position: { row: 2, col: 1 }, photoType: "ct_scan", label: "CT Scan", isRequired: false, size: "medium" },
      { id: "9", position: { row: 2, col: 2 }, photoType: "periapical", label: "Periapical X-Ray", isRequired: false, size: "medium" }
    ]
  },
  {
    id: "cosmetic_focus",
    name: "Cosmetic Focus Grid",
    description: "Layout emphasizing aesthetic dental concerns",
    dimensions: { rows: 2, cols: 4 },
    slots: [
      { id: "1", position: { row: 0, col: 0 }, photoType: "front_smile", label: "Natural Smile", isRequired: true, size: "large" },
      { id: "2", position: { row: 0, col: 1 }, photoType: "retracted_smile", label: "Full Smile", isRequired: true, size: "large" },
      { id: "3", position: { row: 0, col: 2 }, photoType: "close_up_front", label: "Close-up Front", isRequired: true, size: "medium" },
      { id: "4", position: { row: 0, col: 3 }, photoType: "lip_line", label: "Lip Line", isRequired: false, size: "medium" },
      { id: "5", position: { row: 1, col: 0 }, photoType: "upper_arch", label: "Upper Teeth", isRequired: true, size: "medium" },
      { id: "6", position: { row: 1, col: 1 }, photoType: "gum_line", label: "Gum Line", isRequired: false, size: "medium" },
      { id: "7", position: { row: 1, col: 2 }, photoType: "tooth_color", label: "Tooth Color", isRequired: false, size: "medium" },
      { id: "8", position: { row: 1, col: 3 }, photoType: "texture_detail", label: "Texture Detail", isRequired: false, size: "medium" }
    ]
  }
]

// Photo quality validation rules
const qualityValidationRules = [
  {
    id: "brightness",
    name: "Brightness",
    description: "Image brightness level",
    type: "range",
    min: 30,
    max: 220,
    optimal: { min: 80, max: 180 },
    unit: "RGB"
  },
  {
    id: "contrast",
    name: "Contrast",
    description: "Image contrast ratio",
    type: "range", 
    min: 0.3,
    max: 3.0,
    optimal: { min: 1.0, max: 2.0 },
    unit: "ratio"
  },
  {
    id: "sharpness",
    name: "Sharpness",
    description: "Image edge sharpness",
    type: "range",
    min: 0.1,
    max: 1.0,
    optimal: { min: 0.6, max: 1.0 },
    unit: "score"
  },
  {
    id: "resolution",
    name: "Resolution",
    description: "Minimum image resolution",
    type: "minimum",
    value: "1920x1080",
    required: true
  },
  {
    id: "blur_detection",
    name: "Blur Detection",
    description: "Detect motion or focus blur",
    type: "boolean",
    enabled: true,
    threshold: 0.3
  },
  {
    id: "color_accuracy",
    name: "Color Accuracy",
    description: "Natural color representation",
    type: "range",
    min: 0.7,
    max: 1.0,
    optimal: { min: 0.85, max: 1.0 },
    unit: "accuracy"
  }
]

export function DentalPhotoGridConfig({ config, onChange }: PhotoGridConfigProps) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showQualityDialog, setShowQualityDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value })
  }

  const currentGrid = config.grid_layout || gridTemplates[0]
  const enabledValidations = config.quality_validations || []

  const applyTemplate = (template: any) => {
    updateConfig('grid_layout', template)
    updateConfig('template_applied', template.id)
    setShowTemplateDialog(false)
  }

  const toggleValidationRule = (ruleId: string) => {
    const current = [...enabledValidations]
    const index = current.indexOf(ruleId)
    
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(ruleId)
    }
    
    updateConfig('quality_validations', current)
  }

  const updateSlot = (slotId: string, updates: Partial<PhotoSlot>) => {
    const updatedSlots = currentGrid.slots.map((slot: PhotoSlot) =>
      slot.id === slotId ? { ...slot, ...updates } : slot
    )
    updateConfig('grid_layout', { ...currentGrid, slots: updatedSlots })
  }

  const addSlot = () => {
    const newSlot: PhotoSlot = {
      id: `slot-${Date.now()}`,
      position: { row: 0, col: 0 },
      photoType: "front_smile",
      label: "New Photo",
      isRequired: false,
      size: "medium"
    }
    const updatedGrid = {
      ...currentGrid,
      slots: [...currentGrid.slots, newSlot]
    }
    updateConfig('grid_layout', updatedGrid)
  }

  const removeSlot = (slotId: string) => {
    const updatedSlots = currentGrid.slots.filter((slot: PhotoSlot) => slot.id !== slotId)
    updateConfig('grid_layout', { ...currentGrid, slots: updatedSlots })
  }

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'h-16 w-16'
      case 'large': return 'h-32 w-32'
      default: return 'h-24 w-24'
    }
  }

  return (
    <div className="space-y-6">
      {/* Grid Layout Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                Photo Grid Layout
              </CardTitle>
              <CardDescription>
                Configure the photo grid layout and positioning
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
                <LayoutGrid className="mr-2 h-4 w-4" />
                Templates
              </Button>
              <Button variant="outline" onClick={() => setShowQualityDialog(true)}>
                <Target className="mr-2 h-4 w-4" />
                Quality Rules
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Grid Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{currentGrid.slots?.length || 0}</div>
                <div className="text-gray-600">Photo Slots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentGrid.slots?.filter((slot: PhotoSlot) => slot.isRequired).length || 0}
                </div>
                <div className="text-gray-600">Required</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {`${currentGrid.dimensions?.rows || 0}×${currentGrid.dimensions?.cols || 0}`}
                </div>
                <div className="text-gray-600">Grid Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{enabledValidations.length}</div>
                <div className="text-gray-600">Quality Rules</div>
              </div>
            </div>

            {/* Grid Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Grid Preview</h4>
                <Button onClick={addSlot} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Slot
                </Button>
              </div>
              
              <div 
                className="grid gap-2 max-w-2xl mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${currentGrid.dimensions?.cols || 3}, 1fr)`,
                  gridTemplateRows: `repeat(${currentGrid.dimensions?.rows || 2}, 1fr)`
                }}
              >
                {currentGrid.slots?.map((slot: PhotoSlot, index: number) => (
                  <div
                    key={slot.id}
                    className={`relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-2 ${
                      slot.isRequired ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white'
                    } ${getSizeClass(slot.size)}`}
                  >
                    <Camera className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs font-medium text-center">{slot.label}</span>
                    {slot.isRequired && <Badge variant="destructive" className="absolute -top-1 -right-1 text-xs px-1">!</Badge>}
                    
                    {/* Slot Controls */}
                    <div className="absolute top-1 left-1 opacity-0 hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-5 w-5"
                          onClick={() => removeSlot(slot.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slot Configuration */}
            {currentGrid.slots && currentGrid.slots.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Photo Slot Configuration</h4>
                <div className="space-y-2">
                  {currentGrid.slots.map((slot: PhotoSlot) => (
                    <div key={slot.id} className="p-3 border rounded-lg">
                      <div className="grid gap-3 md:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={slot.label}
                            onChange={(e) => updateSlot(slot.id, { label: e.target.value })}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Photo Type</Label>
                          <Select 
                            value={slot.photoType} 
                            onValueChange={(value) => updateSlot(slot.id, { photoType: value })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="front_smile">Front Smile</SelectItem>
                              <SelectItem value="side_profile_right">Right Profile</SelectItem>
                              <SelectItem value="side_profile_left">Left Profile</SelectItem>
                              <SelectItem value="upper_arch">Upper Arch</SelectItem>
                              <SelectItem value="lower_arch">Lower Arch</SelectItem>
                              <SelectItem value="bite_front">Front Bite</SelectItem>
                              <SelectItem value="retracted_smile">Retracted Smile</SelectItem>
                              <SelectItem value="x_ray">X-Ray</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Size</Label>
                          <Select 
                            value={slot.size} 
                            onValueChange={(value) => updateSlot(slot.id, { size: value as any })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={slot.isRequired}
                            onChange={(e) => updateSlot(slot.id, { isRequired: e.target.checked })}
                            className="rounded"
                          />
                          <Label className="text-xs">Required</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Display Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Display Configuration</CardTitle>
          <CardDescription>
            Configure how the photo grid appears to patients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="grid_title">Grid Title</Label>
              <Input
                id="grid_title"
                placeholder="Upload Your Dental Photos"
                value={config.grid_title || ''}
                onChange={(e) => updateConfig('grid_title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completion_message">Completion Message</Label>
              <Input
                id="completion_message"
                placeholder="All photos uploaded successfully!"
                value={config.completion_message || ''}
                onChange={(e) => updateConfig('completion_message', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show_progress"
                checked={config.show_progress !== false}
                onChange={(e) => updateConfig('show_progress', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="show_progress">Show upload progress</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show_instructions"
                checked={config.show_instructions !== false}
                onChange={(e) => updateConfig('show_instructions', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="show_instructions">Show photo instructions</Label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enable_retake"
                checked={config.enable_retake !== false}
                onChange={(e) => updateConfig('enable_retake', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="enable_retake">Allow photo retakes</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_validate"
                checked={config.auto_validate || false}
                onChange={(e) => updateConfig('auto_validate', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="auto_validate">Auto-validate photo quality</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Grid Template</DialogTitle>
            <DialogDescription>
              Choose a pre-configured photo grid layout for common dental assessments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 md:grid-cols-2">
            {gridTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                  selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.slots.length} photos
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.dimensions.rows}×{template.dimensions.cols}
                    </Badge>
                  </div>

                  {/* Mini grid preview */}
                  <div 
                    className="grid gap-1 max-w-xs"
                    style={{ 
                      gridTemplateColumns: `repeat(${template.dimensions.cols}, 1fr)`,
                    }}
                  >
                    {template.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`h-8 w-full border rounded flex items-center justify-center text-xs ${
                          slot.isRequired ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <Camera className="h-3 w-3" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedTemplate && applyTemplate(selectedTemplate)}
              disabled={!selectedTemplate}
            >
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quality Validation Dialog */}
      <Dialog open={showQualityDialog} onOpenChange={setShowQualityDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Photo Quality Validation</DialogTitle>
            <DialogDescription>
              Configure automatic photo quality validation rules.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {qualityValidationRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 border rounded-lg ${
                  enabledValidations.includes(rule.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enabledValidations.includes(rule.id)}
                        onChange={() => toggleValidationRule(rule.id)}
                        className="rounded"
                      />
                      <h5 className="font-medium">{rule.name}</h5>
                      {rule.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    
                    {rule.type === 'range' && rule.optimal && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Optimal range: {rule.optimal.min} - {rule.optimal.max} {rule.unit}</span>
                      </div>
                    )}
                    
                    {rule.type === 'minimum' && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Minimum: {rule.value}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {enabledValidations.includes(rule.id) ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border border-gray-300 rounded" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowQualityDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 