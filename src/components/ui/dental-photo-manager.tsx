'use client'

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  Settings,
  Eye,
  Image,
  Folder,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Camera,
  Zap,
  Archive,
  Trash2,
  Copy,
  Share2,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react"

interface PhotoManagerProps {
  config: Record<string, any>
  onChange: (config: Record<string, any>) => void
}

interface PhotoPreview {
  id: string
  type: string
  label: string
  url: string
  size: number
  format: string
  quality: 'excellent' | 'good' | 'poor'
  validationResults: Record<string, any>
}

interface CompressionSetting {
  id: string
  name: string
  quality: number
  maxSize: number
  format: string
  description: string
}

const compressionPresets: CompressionSetting[] = [
  {
    id: "ultra_high",
    name: "Ultra High Quality",
    quality: 95,
    maxSize: 10,
    format: "jpeg",
    description: "Best quality for clinical documentation"
  },
  {
    id: "high",
    name: "High Quality",
    quality: 85,
    maxSize: 5,
    format: "jpeg",
    description: "Excellent quality with reasonable file size"
  },
  {
    id: "standard",
    name: "Standard Quality",
    quality: 75,
    maxSize: 3,
    format: "jpeg",
    description: "Good quality for most purposes"
  },
  {
    id: "web_optimized",
    name: "Web Optimized",
    quality: 65,
    maxSize: 1,
    format: "webp",
    description: "Optimized for web viewing and sharing"
  }
]

const mockPhotos: PhotoPreview[] = [
  {
    id: "1",
    type: "front_smile",
    label: "Front Smile",
    url: "/api/placeholder/400/300",
    size: 2.4,
    format: "JPEG",
    quality: "excellent",
    validationResults: { brightness: 85, contrast: 1.2, sharpness: 0.8 }
  },
  {
    id: "2", 
    type: "side_profile_right",
    label: "Right Profile",
    url: "/api/placeholder/400/300",
    size: 1.8,
    format: "JPEG", 
    quality: "good",
    validationResults: { brightness: 75, contrast: 1.1, sharpness: 0.7 }
  },
  {
    id: "3",
    type: "upper_arch",
    label: "Upper Arch",
    url: "/api/placeholder/400/300",
    size: 3.2,
    format: "PNG",
    quality: "excellent",
    validationResults: { brightness: 90, contrast: 1.3, sharpness: 0.9 }
  }
]

export function DentalPhotoManager({ config, onChange }: PhotoManagerProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoPreview | null>(null)
  const [showCompressionDialog, setShowCompressionDialog] = useState(false)
  const [showBackupDialog, setShowBackupDialog] = useState(false)

  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value })
  }

  const startSimulation = () => {
    setIsSimulating(true)
    setSimulationProgress(0)
    
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSimulating(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPreviewSize = () => {
    switch (previewMode) {
      case 'mobile': return 'max-w-xs'
      case 'tablet': return 'max-w-md'
      default: return 'max-w-2xl'
    }
  }

  return (
    <div className="space-y-6">
      {/* Preview System */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Photo Preview System
              </CardTitle>
              <CardDescription>
                Preview how patients will see the photo upload interface
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="mr-2 h-4 w-4" />
                Desktop
              </Button>
              <Button
                variant={previewMode === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('tablet')}
              >
                <Tablet className="mr-2 h-4 w-4" />
                Tablet
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Mobile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`mx-auto border rounded-lg p-4 bg-white ${getPreviewSize()}`}>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Upload Your Dental Photos</h3>
                <p className="text-gray-600 text-sm">Please upload the following photos for your dental assessment</p>
              </div>
              
              {/* Photo Grid Preview */}
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                {mockPhotos.map((photo) => (
                  <div key={photo.id} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm font-medium">{photo.label}</div>
                    <div className="text-xs text-gray-500 mt-1">Tap to upload</div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <Button>Continue</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Simulation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Upload Simulation
              </CardTitle>
              <CardDescription>
                Test the photo upload flow and validation process
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={startSimulation}
                disabled={isSimulating}
                variant={isSimulating ? 'outline' : 'default'}
              >
                {isSimulating ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Simulation
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setSimulationProgress(0)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isSimulating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{simulationProgress}%</span>
                </div>
                <Progress value={simulationProgress} className="h-2" />
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-3">
              {mockPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    simulationProgress > index * 33 ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      simulationProgress > index * 33 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {simulationProgress > index * 33 ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{photo.label}</div>
                      <div className="text-xs text-gray-500">{photo.size}MB • {photo.format}</div>
                      <Badge 
                        className={`mt-1 text-xs ${getQualityColor(photo.quality)}`}
                        variant="outline"
                      >
                        {photo.quality}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compression Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Compression Settings
              </CardTitle>
              <CardDescription>
                Configure automatic photo compression and optimization
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowCompressionDialog(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Advanced Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="compression_preset">Compression Preset</Label>
                <Select 
                  value={config.compression_preset || 'high'} 
                  onValueChange={(value) => updateConfig('compression_preset', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {compressionPresets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auto_compress">Auto Compression</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_compress"
                    checked={config.auto_compress !== false}
                    onChange={(e) => updateConfig('auto_compress', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="auto_compress">Enable automatic compression</Label>
                </div>
              </div>
            </div>

            {/* Current Compression Settings Display */}
            {config.compression_preset && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Current Settings</h4>
                <div className="grid gap-2 md:grid-cols-4 text-sm">
                  {compressionPresets.find(p => p.id === config.compression_preset) && (
                    <>
                      <div>
                        <span className="font-medium">Quality:</span> {compressionPresets.find(p => p.id === config.compression_preset)?.quality}%
                      </div>
                      <div>
                        <span className="font-medium">Max Size:</span> {compressionPresets.find(p => p.id === config.compression_preset)?.maxSize}MB
                      </div>
                      <div>
                        <span className="font-medium">Format:</span> {compressionPresets.find(p => p.id === config.compression_preset)?.format?.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium">Description:</span> {compressionPresets.find(p => p.id === config.compression_preset)?.description}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup & Versioning */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Backup & Versioning
              </CardTitle>
              <CardDescription>
                Configure photo backup and version control settings
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowBackupDialog(true)}>
              <Folder className="mr-2 h-4 w-4" />
              Manage Backups
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_backup"
                  checked={config.auto_backup !== false}
                  onChange={(e) => updateConfig('auto_backup', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="auto_backup">Enable automatic backups</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="version_control"
                  checked={config.version_control || false}
                  onChange={(e) => updateConfig('version_control', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="version_control">Enable version control</Label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="backup_frequency">Backup Frequency</Label>
                <Select 
                  value={config.backup_frequency || 'daily'} 
                  onValueChange={(value) => updateConfig('backup_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="retention_period">Retention Period (days)</Label>
                <Input
                  id="retention_period"
                  type="number"
                  placeholder="30"
                  value={config.retention_period || ''}
                  onChange={(e) => updateConfig('retention_period', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Backup Status */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Backup Status: Active</span>
              </div>
              <div className="text-sm text-green-600 mt-1">
                Last backup: 2 hours ago • Next backup: in 22 hours
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Photo Details</DialogTitle>
            <DialogDescription>
              Detailed information and validation results for {selectedPhoto?.label}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Photo Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Type:</strong> {selectedPhoto.type}</div>
                    <div><strong>Size:</strong> {selectedPhoto.size}MB</div>
                    <div><strong>Format:</strong> {selectedPhoto.format}</div>
                    <div><strong>Quality:</strong> 
                      <Badge className={`ml-2 ${getQualityColor(selectedPhoto.quality)}`} variant="outline">
                        {selectedPhoto.quality}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Validation Results</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Brightness:</strong> {selectedPhoto.validationResults.brightness}/100</div>
                    <div><strong>Contrast:</strong> {selectedPhoto.validationResults.contrast}</div>
                    <div><strong>Sharpness:</strong> {selectedPhoto.validationResults.sharpness}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedPhoto(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compression Dialog */}
      <Dialog open={showCompressionDialog} onOpenChange={setShowCompressionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advanced Compression Settings</DialogTitle>
            <DialogDescription>
              Fine-tune photo compression and optimization settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="custom_quality">Custom Quality (%)</Label>
                <Input
                  id="custom_quality"
                  type="number"
                  min="1"
                  max="100"
                  value={config.custom_quality || ''}
                  onChange={(e) => updateConfig('custom_quality', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="progressive_jpeg">Progressive JPEG</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="progressive_jpeg"
                    checked={config.progressive_jpeg || false}
                    onChange={(e) => updateConfig('progressive_jpeg', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="progressive_jpeg">Enable progressive loading</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompressionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCompressionDialog(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Management Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Backup Management</DialogTitle>
            <DialogDescription>
              View and manage photo backups and versions.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="recent" className="space-y-4">
            <TabsList>
              <TabsTrigger value="recent">Recent Backups</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Backup #{i + 1}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()} • 
                        {Math.floor(Math.random() * 50) + 10}MB
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="scheduled">
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2" />
                <p>No scheduled backups found</p>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Storage Location</Label>
                    <Select defaultValue="cloud">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cloud">Cloud Storage</SelectItem>
                        <SelectItem value="local">Local Storage</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Encryption</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={true}
                        className="rounded"
                        readOnly
                      />
                      <Label>Enable encryption</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => setShowBackupDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 