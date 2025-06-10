'use client'

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DentalPhotoUploadConfig } from "./dental-photo-config"
import { DentalPhotoGridConfig } from "./dental-photo-grid"
import { DentalPhotoManager } from "./dental-photo-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus,
  Trash2,
  GripVertical,
  Type,
  Hash,
  Star,
  Upload,
  CircleDot,
  CheckSquare
} from "lucide-react"
import { QuestionType } from "@/types/database"

interface QuestionConfigProps {
  questionType: QuestionType
  config: Record<string, any>
  onChange: (config: Record<string, any>) => void
}

// Text Input Configuration
export function TextInputConfig({ config, onChange }: QuestionConfigProps) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Text Input Configuration
          </CardTitle>
          <CardDescription>
            Configure validation rules and formatting for text input.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min_length">Minimum Length</Label>
              <Input
                id="min_length"
                type="number"
                placeholder="0"
                value={config.min_length || ''}
                onChange={(e) => updateConfig('min_length', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_length">Maximum Length</Label>
              <Input
                id="max_length"
                type="number"
                placeholder="255"
                value={config.max_length || ''}
                onChange={(e) => updateConfig('max_length', parseInt(e.target.value) || 255)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pattern">Validation Pattern (Regex)</Label>
            <Input
              id="pattern"
              placeholder="^[a-zA-Z\s]+$ (letters and spaces only)"
              value={config.pattern || ''}
              onChange={(e) => updateConfig('pattern', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Use regex pattern to validate input format
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transform">Text Transform</Label>
            <Select 
              value={config.transform || 'none'} 
              onValueChange={(value) => updateConfig('transform', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transformation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="uppercase">UPPERCASE</SelectItem>
                <SelectItem value="lowercase">lowercase</SelectItem>
                <SelectItem value="capitalize">Capitalize First Letter</SelectItem>
                <SelectItem value="title">Title Case</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="trim_whitespace"
              checked={config.trim_whitespace || false}
              onChange={(e) => updateConfig('trim_whitespace', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="trim_whitespace">Trim leading/trailing whitespace</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Number Input Configuration
export function NumberInputConfig({ config, onChange }: QuestionConfigProps) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Number Input Configuration
          </CardTitle>
          <CardDescription>
            Configure numeric validation and formatting options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="min_value">Minimum Value</Label>
              <Input
                id="min_value"
                type="number"
                placeholder="0"
                value={config.min_value || ''}
                onChange={(e) => updateConfig('min_value', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_value">Maximum Value</Label>
              <Input
                id="max_value"
                type="number"
                placeholder="100"
                value={config.max_value || ''}
                onChange={(e) => updateConfig('max_value', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step">Step Size</Label>
              <Input
                id="step"
                type="number"
                placeholder="1"
                value={config.step || ''}
                onChange={(e) => updateConfig('step', parseFloat(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="decimal_places">Decimal Places</Label>
              <Select 
                value={config.decimal_places?.toString() || '0'} 
                onValueChange={(value) => updateConfig('decimal_places', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select decimal places" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (Integer)</SelectItem>
                  <SelectItem value="1">1 (0.1)</SelectItem>
                  <SelectItem value="2">2 (0.01)</SelectItem>
                  <SelectItem value="3">3 (0.001)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="kg, cm, years, etc."
                value={config.unit || ''}
                onChange={(e) => updateConfig('unit', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allow_negative"
              checked={config.allow_negative || false}
              onChange={(e) => updateConfig('allow_negative', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="allow_negative">Allow negative values</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Choice Question Configuration
export function ChoiceQuestionConfig({ questionType, config, onChange }: QuestionConfigProps) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value })
  }

  const options = config.options || []

  const addOption = () => {
    const newOptions = [...options, { id: `option-${Date.now()}`, label: '', value: '', order: options.length }]
    updateConfig('options', newOptions)
  }

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    updateConfig('options', newOptions)
  }

  const removeOption = (index: number) => {
    const newOptions = options.filter((_: any, i: number) => i !== index)
    updateConfig('options', newOptions)
  }

  const isMultiple = questionType === 'multiple_choice'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isMultiple ? <CheckSquare className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
            {isMultiple ? 'Multiple Choice' : 'Single Choice'} Configuration
          </CardTitle>
          <CardDescription>
            Configure the available options for this question.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isMultiple && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="min_selections">Minimum Selections</Label>
                <Input
                  id="min_selections"
                  type="number"
                  placeholder="1"
                  value={config.min_selections || ''}
                  onChange={(e) => updateConfig('min_selections', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_selections">Maximum Selections</Label>
                <Input
                  id="max_selections"
                  type="number"
                  placeholder="No limit"
                  value={config.max_selections || ''}
                  onChange={(e) => updateConfig('max_selections', parseInt(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button onClick={addOption} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
            
            <div className="space-y-2">
              {options.map((option: any, index: number) => (
                <div key={option.id || index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 grid gap-2 md:grid-cols-2">
                    <Input
                      placeholder="Option label (what users see)"
                      value={option.label || ''}
                      onChange={(e) => updateOption(index, 'label', e.target.value)}
                    />
                    <Input
                      placeholder="Option value (stored data)"
                      value={option.value || ''}
                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {options.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CircleDot className="mx-auto h-8 w-8 mb-2" />
                <p>No options added yet</p>
                <p className="text-sm">Click &quot;Add Option&quot; to get started</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_style">Display Style</Label>
            <Select 
              value={config.display_style || 'vertical'} 
              onValueChange={(value) => updateConfig('display_style', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select display style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical List</SelectItem>
                <SelectItem value="horizontal">Horizontal List</SelectItem>
                <SelectItem value="grid">Grid Layout</SelectItem>
                <SelectItem value="dropdown">Dropdown Menu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="randomize_order"
              checked={config.randomize_order || false}
              onChange={(e) => updateConfig('randomize_order', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="randomize_order">Randomize option order</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Rating Configuration
export function RatingConfig({ config, onChange }: QuestionConfigProps) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Rating Configuration
          </CardTitle>
          <CardDescription>
            Configure the rating scale and appearance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="min_rating">Minimum Rating</Label>
              <Input
                id="min_rating"
                type="number"
                placeholder="1"
                value={config.min_rating || ''}
                onChange={(e) => updateConfig('min_rating', parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_rating">Maximum Rating</Label>
              <Input
                id="max_rating"
                type="number"
                placeholder="5"
                value={config.max_rating || ''}
                onChange={(e) => updateConfig('max_rating', parseInt(e.target.value) || 5)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step">Step Size</Label>
              <Select 
                value={config.step?.toString() || '1'} 
                onValueChange={(value) => updateConfig('step', parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (whole numbers)</SelectItem>
                  <SelectItem value="0.5">0.5 (half stars)</SelectItem>
                  <SelectItem value="0.1">0.1 (precise)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min_label">Minimum Label</Label>
              <Input
                id="min_label"
                placeholder="Poor"
                value={config.min_label || ''}
                onChange={(e) => updateConfig('min_label', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_label">Maximum Label</Label>
              <Input
                id="max_label"
                placeholder="Excellent"
                value={config.max_label || ''}
                onChange={(e) => updateConfig('max_label', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating_style">Rating Style</Label>
            <Select 
              value={config.rating_style || 'stars'} 
              onValueChange={(value) => updateConfig('rating_style', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rating style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stars">Stars (⭐)</SelectItem>
                <SelectItem value="hearts">Hearts (❤️)</SelectItem>
                <SelectItem value="thumbs">Thumbs (👍)</SelectItem>
                <SelectItem value="numbers">Numbers (1-5)</SelectItem>
                <SelectItem value="faces">Faces (😞-😊)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="show_value"
              checked={config.show_value || false}
              onChange={(e) => updateConfig('show_value', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="show_value">Show numeric value</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// File Upload Configuration
export function FileUploadConfig({ config, onChange }: QuestionConfigProps) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value })
  }

  const allowedTypes = config.allowed_types || []

  const toggleFileType = (type: string) => {
    const currentTypes = [...allowedTypes]
    const index = currentTypes.indexOf(type)
    
    if (index > -1) {
      currentTypes.splice(index, 1)
    } else {
      currentTypes.push(type)
    }
    
    updateConfig('allowed_types', currentTypes)
  }

  const commonFileTypes = [
    { type: 'image/jpeg', label: 'JPEG Images', extension: '.jpg, .jpeg' },
    { type: 'image/png', label: 'PNG Images', extension: '.png' },
    { type: 'image/webp', label: 'WebP Images', extension: '.webp' },
    { type: 'application/pdf', label: 'PDF Documents', extension: '.pdf' },
    { type: 'application/msword', label: 'Word Documents', extension: '.doc' },
    { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word Documents (new)', extension: '.docx' },
    { type: 'text/plain', label: 'Text Files', extension: '.txt' }
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            File Upload Configuration
          </CardTitle>
          <CardDescription>
            Configure file upload restrictions and requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max_file_size">Maximum File Size (MB)</Label>
              <Input
                id="max_file_size"
                type="number"
                placeholder="10"
                value={config.max_file_size || ''}
                onChange={(e) => updateConfig('max_file_size', parseInt(e.target.value) || 10)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_files">Maximum Files</Label>
              <Input
                id="max_files"
                type="number"
                placeholder="1"
                value={config.max_files || ''}
                onChange={(e) => updateConfig('max_files', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Allowed File Types</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {commonFileTypes.map((fileType) => (
                <div key={fileType.type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={fileType.type}
                    checked={allowedTypes.includes(fileType.type)}
                    onChange={() => toggleFileType(fileType.type)}
                    className="rounded"
                  />
                  <Label htmlFor={fileType.type} className="flex-1">
                    <div className="font-medium text-sm">{fileType.label}</div>
                    <div className="text-xs text-gray-500">{fileType.extension}</div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload_text">Upload Button Text</Label>
            <Input
              id="upload_text"
              placeholder="Choose files or drag and drop"
              value={config.upload_text || ''}
              onChange={(e) => updateConfig('upload_text', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="require_all_files"
                checked={config.require_all_files || false}
                onChange={(e) => updateConfig('require_all_files', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="require_all_files">Require all file slots to be filled</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show_preview"
                checked={config.show_preview !== false}
                onChange={(e) => updateConfig('show_preview', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="show_preview">Show file preview thumbnails</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Question Configuration Component
export function QuestionConfigForm({ questionType, config, onChange }: QuestionConfigProps) {
  const renderConfigForm = () => {
    switch (questionType) {
      case 'text':
      case 'textarea':
      case 'email':
      case 'phone':
        return <TextInputConfig questionType={questionType} config={config} onChange={onChange} />
      
      case 'number':
      case 'slider':
      case 'budget_range':
        return <NumberInputConfig questionType={questionType} config={config} onChange={onChange} />
      
      case 'single_choice':
      case 'multiple_choice':
      case 'checkbox':
        return <ChoiceQuestionConfig questionType={questionType} config={config} onChange={onChange} />
      
      case 'rating':
      case 'pain_scale':
        return <RatingConfig questionType={questionType} config={config} onChange={onChange} />
      
      case 'file_upload':
        return <FileUploadConfig questionType={questionType} config={config} onChange={onChange} />
      
      case 'photo_upload':
        return <DentalPhotoUploadConfiguration questionType={questionType} config={config} onChange={onChange} />
      
      case 'photo_grid':
        return <PhotoGridConfiguration questionType={questionType} config={config} onChange={onChange} />
      
      default:
        return (
          <Card>
            <CardContent className="py-6">
              <p className="text-center text-gray-500">
                Configuration for {questionType} questions is not yet implemented.
              </p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderConfigForm()}
    </div>
  )
}

// Dental Photo Upload Configuration - Enhanced for dental tourism
export function DentalPhotoUploadConfiguration({ config, onChange }: QuestionConfigProps) {
  return (
    <div className="space-y-6">
      <DentalPhotoUploadConfig config={config} onChange={onChange} />
    </div>
  )
}

// Photo Grid Configuration - For multiple dental photos in a grid layout
export function PhotoGridConfiguration({ config, onChange }: QuestionConfigProps) {
  return (
    <div className="space-y-6">
      <DentalPhotoGridConfig config={config} onChange={onChange} />
    </div>
  )
}