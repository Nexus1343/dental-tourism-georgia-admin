'use client'

import React, { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Camera,
  Upload,
  Image,
  Eye,
  Settings,
  Grid3X3,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Users,
  Smile,
  Target
} from "lucide-react"

interface DentalPhotoConfigProps {
  config: Record<string, any>
  onChange: (config: Record<string, any>) => void
}

// Dental photo types with specific requirements
const dentalPhotoTypes = [
  {
    id: "front_smile",
    name: "Front Smile",
    description: "Full frontal smile showing both upper and lower teeth",
    icon: Smile,
    category: "Basic Views",
    requirements: {
      angle: "Straight front view",
      lighting: "Even, soft lighting",
      background: "Neutral background",
      teeth_visible: "All front teeth clearly visible",
      lips_position: "Natural smile, lips retracted"
    },
    technical: {
      min_resolution: "1920x1080",
      aspect_ratio: "16:9 or 4:3",
      file_formats: ["jpeg", "png"],
      max_file_size: "5MB"
    }
  },
  {
    id: "side_profile_right",
    name: "Right Side Profile",
    description: "Right side profile showing bite relationship",
    icon: Users,
    category: "Profile Views",
    requirements: {
      angle: "90-degree side view from right",
      lighting: "Even side lighting",
      teeth_visible: "Bite relationship clearly visible",
      jaw_position: "Natural bite, slightly open"
    },
    technical: {
      min_resolution: "1920x1080",
      aspect_ratio: "4:3",
      file_formats: ["jpeg", "png"],
      max_file_size: "5MB"
    }
  },
  {
    id: "side_profile_left",
    name: "Left Side Profile",
    description: "Left side profile showing bite relationship",
    icon: Users,
    category: "Profile Views",
    requirements: {
      angle: "90-degree side view from left",
      lighting: "Even side lighting",
      teeth_visible: "Bite relationship clearly visible",
      jaw_position: "Natural bite, slightly open"
    },
    technical: {
      min_resolution: "1920x1080",
      aspect_ratio: "4:3",
      file_formats: ["jpeg", "png"],
      max_file_size: "5MB"
    }
  },
  {
    id: "upper_arch",
    name: "Upper Arch (Occlusal)",
    description: "Top-down view of upper teeth arrangement",
    icon: Target,
    category: "Intraoral Views",
    requirements: {
      angle: "Direct overhead view",
      lighting: "Bright, even intraoral lighting",
      teeth_visible: "All upper teeth from canine to canine minimum",
      focus: "Sharp focus on tooth surfaces"
    },
    technical: {
      min_resolution: "2048x1536",
      aspect_ratio: "4:3",
      file_formats: ["jpeg", "png"],
      max_file_size: "8MB"
    }
  },
  {
    id: "lower_arch",
    name: "Lower Arch (Occlusal)",
    description: "Bottom-up view of lower teeth arrangement",
    icon: Target,
    category: "Intraoral Views",
    requirements: {
      angle: "Direct bottom-up view",
      lighting: "Bright, even intraoral lighting",
      teeth_visible: "All lower teeth from canine to canine minimum",
      focus: "Sharp focus on tooth surfaces"
    },
    technical: {
      min_resolution: "2048x1536",
      aspect_ratio: "4:3",
      file_formats: ["jpeg", "png"],
      max_file_size: "8MB"
    }
  },
  {
    id: "bite_front",
    name: "Front Bite View",
    description: "Front view with teeth in bite position",
    icon: Grid3X3,
    category: "Bite Views",
    requirements: {
      angle: "Straight front view",
      lighting: "Even lighting",
      teeth_position: "Teeth in natural bite position",
      visibility: "Both upper and lower teeth edges visible"
    },
    technical: {
      min_resolution: "1920x1080",
      aspect_ratio: "16:9",
      file_formats: ["jpeg", "png"],
      max_file_size: "5MB"
    }
  },
  {
    id: "x_ray",
    name: "X-Ray Images",
    description: "Panoramic or periapical X-ray images",
    icon: Zap,
    category: "Radiographic",
    requirements: {
      quality: "High resolution medical grade",
      format: "DICOM preferred, high-res JPEG acceptable",
      positioning: "Proper patient positioning",
      exposure: "Correct exposure settings"
    },
    technical: {
      min_resolution: "2048x1536",
      aspect_ratio: "Variable",
      file_formats: ["dicom", "jpeg", "png"],
      max_file_size: "20MB"
    }
  },
  {
    id: "retracted_smile",
    name: "Retracted Smile",
    description: "Full smile with lip retractors showing maximum teeth",
    icon: Eye,
    category: "Clinical Views",
    requirements: {
      angle: "Straight front view",
      retraction: "Lip retractors properly positioned",
      visibility: "Maximum tooth exposure",
      lighting: "Clinical lighting, shadow-free"
    },
    technical: {
      min_resolution: "2048x1536",
      aspect_ratio: "4:3",
      file_formats: ["jpeg", "png"],
      max_file_size: "8MB"
    }
  }
]

// Group photo types by category
const photoCategories = dentalPhotoTypes.reduce((acc, type) => {
  if (!acc[type.category]) {
    acc[type.category] = []
  }
  acc[type.category].push(type)
  return acc
}, {} as Record<string, typeof dentalPhotoTypes>)

// Dental assessment templates
const assessmentTemplates = [
  {
    id: "basic_consultation",
    name: "Basic Dental Consultation",
    description: "Standard photos for initial dental assessment",
    photoTypes: ["front_smile", "side_profile_right", "side_profile_left"],
    estimatedTime: "5-10 minutes",
    icon: Smile
  },
  {
    id: "orthodontic_evaluation",
    name: "Orthodontic Evaluation",
    description: "Comprehensive photos for orthodontic treatment planning",
    photoTypes: ["front_smile", "side_profile_right", "side_profile_left", "upper_arch", "lower_arch", "bite_front"],
    estimatedTime: "10-15 minutes",
    icon: Grid3X3
  },
  {
    id: "cosmetic_consultation",
    name: "Cosmetic Consultation", 
    description: "Photos focused on aesthetic dental improvements",
    photoTypes: ["front_smile", "retracted_smile", "upper_arch", "bite_front"],
    estimatedTime: "8-12 minutes",
    icon: Eye
  },
  {
    id: "implant_planning",
    name: "Implant Planning",
    description: "Complete documentation for dental implant procedures",
    photoTypes: ["front_smile", "side_profile_right", "side_profile_left", "upper_arch", "lower_arch", "x_ray"],
    estimatedTime: "15-20 minutes",
    icon: Target
  },
  {
    id: "comprehensive_exam",
    name: "Comprehensive Examination",
    description: "Full dental documentation with all photo types",
    photoTypes: ["front_smile", "side_profile_right", "side_profile_left", "upper_arch", "lower_arch", "bite_front", "retracted_smile", "x_ray"],
    estimatedTime: "20-30 minutes",
    icon: CheckCircle
  }
]

export function DentalPhotoUploadConfig({ config, onChange }: DentalPhotoConfigProps) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value })
  }

  const selectedPhotoTypes = config.required_photos || []
  
  const togglePhotoType = (photoTypeId: string) => {
    const currentTypes = [...selectedPhotoTypes]
    const index = currentTypes.indexOf(photoTypeId)
    
    if (index > -1) {
      currentTypes.splice(index, 1)
    } else {
      currentTypes.push(photoTypeId)
    }
    
    updateConfig('required_photos', currentTypes)
  }

  const applyTemplate = (template: any) => {
    updateConfig('required_photos', template.photoTypes)
    updateConfig('template_applied', template.id)
    updateConfig('estimated_time', template.estimatedTime)
    setShowTemplateDialog(false)
  }

  const getPhotoTypeById = (id: string) => {
    return dentalPhotoTypes.find(type => type.id === id)
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Dental Photo Configuration
              </CardTitle>
              <CardDescription>
                Configure dental photo requirements for patient assessment
              </CardDescription>
            </div>
            <Button onClick={() => setShowTemplateDialog(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Use Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {config.template_applied && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Info className="h-4 w-4" />
                <span className="font-medium">
                  Template Applied: {assessmentTemplates.find(t => t.id === config.template_applied)?.name}
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Estimated time: {config.estimated_time}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{selectedPhotoTypes.length}</div>
              <div className="text-gray-600">Required Photos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(selectedPhotoTypes.map((id: string) => getPhotoTypeById(id)?.category)).size}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {selectedPhotoTypes.filter((id: string) => getPhotoTypeById(id)?.category === 'Intraoral Views').length}
              </div>
              <div className="text-gray-600">Intraoral</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {selectedPhotoTypes.filter((id: string) => getPhotoTypeById(id)?.category === 'Basic Views').length}
              </div>
              <div className="text-gray-600">Basic Views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Required Photo Types</CardTitle>
          <CardDescription>
            Select the dental photos required for this question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Types</TabsTrigger>
              {Object.keys(photoCategories).map((category) => (
                <TabsTrigger key={category} value={category.toLowerCase().replace(' ', '_')}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {Object.entries(photoCategories).map(([category, types]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-gray-900">{category}</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {types.map((photoType) => (
                      <div
                        key={photoType.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPhotoTypes.includes(photoType.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => togglePhotoType(photoType.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedPhotoTypes.includes(photoType.id)
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <photoType.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{photoType.name}</h5>
                              {selectedPhotoTypes.includes(photoType.id) && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{photoType.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {photoType.technical.min_resolution}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Max {photoType.technical.max_file_size}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {Object.entries(photoCategories).map(([category, types]) => (
              <TabsContent key={category} value={category.toLowerCase().replace(' ', '_')} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {types.map((photoType) => (
                    <div
                      key={photoType.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPhotoTypes.includes(photoType.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePhotoType(photoType.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedPhotoTypes.includes(photoType.id)
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <photoType.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{photoType.name}</h5>
                            {selectedPhotoTypes.includes(photoType.id) && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{photoType.description}</p>
                          
                          {/* Technical Requirements */}
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                            <div className="grid gap-1">
                              <div><strong>Resolution:</strong> {photoType.technical.min_resolution}+</div>
                              <div><strong>Formats:</strong> {photoType.technical.file_formats.join(', ')}</div>
                              <div><strong>Max size:</strong> {photoType.technical.max_file_size}</div>
                            </div>
                          </div>

                          {/* Photo Requirements */}
                          <div className="mt-2 text-xs text-gray-600">
                            {Object.entries(photoType.requirements).map(([key, value]) => (
                              <div key={key} className="flex">
                                <span className="font-medium capitalize w-20">{key.replace('_', ' ')}:</span>
                                <span>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Configuration</CardTitle>
          <CardDescription>
            Configure photo upload settings and quality requirements
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
                onChange={(e) => updateConfig('max_file_size', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compression_quality">Compression Quality (%)</Label>
              <Input
                id="compression_quality"
                type="number"
                placeholder="85"
                min="1"
                max="100"
                value={config.compression_quality || ''}
                onChange={(e) => updateConfig('compression_quality', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload_instructions">Upload Instructions</Label>
            <Textarea
              id="upload_instructions"
              placeholder="Please ensure photos are well-lit and clearly show the requested dental views..."
              rows={3}
              value={config.upload_instructions || ''}
              onChange={(e) => updateConfig('upload_instructions', e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="require_all_photos"
                checked={config.require_all_photos !== false}
                onChange={(e) => updateConfig('require_all_photos', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="require_all_photos">Require all selected photo types</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show_photo_guides"
                checked={config.show_photo_guides !== false}
                onChange={(e) => updateConfig('show_photo_guides', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="show_photo_guides">Show photo guide overlays</Label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_enhance"
                checked={config.auto_enhance || false}
                onChange={(e) => updateConfig('auto_enhance', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="auto_enhance">Auto-enhance uploaded photos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="generate_thumbnails"
                checked={config.generate_thumbnails !== false}
                onChange={(e) => updateConfig('generate_thumbnails', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="generate_thumbnails">Generate thumbnail previews</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Assessment Template</DialogTitle>
            <DialogDescription>
              Choose a pre-configured photo requirement template for common dental assessments.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 md:grid-cols-2">
            {assessmentTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-300 ${
                  selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <template.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {template.photoTypes.length} photos
                      </Badge>
                      <Badge variant="outline" className="text-xs ml-2">
                        {template.estimatedTime}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Includes:</strong> {template.photoTypes.map(id => 
                        getPhotoTypeById(id)?.name
                      ).join(', ')}
                    </div>
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
    </div>
  )
} 