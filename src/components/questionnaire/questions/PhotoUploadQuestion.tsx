'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BaseQuestion } from './BaseQuestion';
import { QuestionRendererProps } from '@/types/questionnaire';
import { QuestionnaireQuestion as DBQuestionnaireQuestion } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, Eye, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: 'photo' | 'document';
}

export function PhotoUploadQuestion({ 
  question, 
  value, 
  onChange, 
  onBlur, 
  error, 
  disabled = false,
  showValidation = true 
}: QuestionRendererProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const maxFiles = question.validation_rules?.max_files || 5;
  const maxFileSize = question.validation_rules?.max_file_size || 10485760; // 10MB
  const acceptedTypes = question.validation_rules?.accepted_types || ['image/jpeg', 'image/png', 'image/heic'];
  
  // Initialize files from value prop
  useEffect(() => {
    if (value && Array.isArray(value) && value.length > 0) {
      const initialFiles: UploadedFile[] = value.map((item: any) => {
        if (item.file && item.preview) {
          return item;
        } else if (item instanceof File) {
          return {
            id: `file-${Date.now()}-${Math.random()}`,
            file: item,
            preview: URL.createObjectURL(item),
            type: item.type.startsWith('image/') ? 'photo' : 'document'
          };
        }
        return null;
      }).filter(Boolean);
      
      setFiles(initialFiles);
    } else {
      setFiles([]);
    }
  }, [value]);
  
  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);
  
  const handleFiles = useCallback((newFiles: File[]) => {
    const processedFiles: UploadedFile[] = [];
    
    newFiles.forEach((file) => {
      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        return; // Skip invalid files
      }
      
      // Validate file size
      if (file.size > maxFileSize) {
        return; // Skip oversized files
      }
      
      // Check if we're at max files
      if (files.length + processedFiles.length >= maxFiles) {
        return; // Skip if at limit
      }
      
      const id = `file-${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);
      
      processedFiles.push({
        id,
        file,
        preview,
        type: file.type.startsWith('image/') ? 'photo' : 'document'
      });
    });
    
    const updatedFiles = [...files, ...processedFiles];
    setFiles(updatedFiles);
    onChange(updatedFiles);
  }, [files, maxFiles, maxFileSize, acceptedTypes, onChange]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [handleFiles]);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
    
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  }, [handleFiles]);
  
  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onChange(updatedFiles);
    
    // Clean up preview URL
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  }, [files, onChange]);
  
  const openCamera = () => {
    cameraInputRef.current?.click();
  };
  
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <BaseQuestion 
      question={question} 
      error={error} 
      showValidation={showValidation}
    >
      <div className="space-y-4">
        {/* Upload Instructions */}
        {/* Removed duplicate blue-framed help text. The standard help text from BaseQuestion will be shown. */}

        {/* Example Photo */}
        {(() => {
          const options = question.options as any;
          const examplePhoto = options?.example_photo;
          return examplePhoto?.url && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">Example Photo</h4>
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={examplePhoto.url}
                    alt="Example photo"
                    className="w-full max-w-md h-48 object-cover rounded-lg border mx-auto"
                  />
                </div>
                {examplePhoto.instructions && (
                  <p className="text-sm text-green-700">
                    {examplePhoto.instructions}
                  </p>
                )}
              </div>
            </div>
          );
        })()}
        
        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragOver ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
            error && showValidation && "border-red-300"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drag and drop photos here, or
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Maximum {maxFiles} files, up to {Math.round(maxFileSize / 1024 / 1024)}MB each
              </p>
            </div>
            
            <div className="flex justify-center space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={openCamera}
                disabled={disabled || files.length >= maxFiles}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Take Photo</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={openFileSelector}
                disabled={disabled || files.length >= maxFiles}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Browse Files</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Uploaded Files Preview */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              Uploaded Photos ({files.length}/{maxFiles})
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <Card key={file.id} className="relative group">
                  <CardContent className="p-2">
                    <div className="aspect-square relative">
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          console.error('Failed to load image preview:', file.file.name);
                          // Try to recreate the preview URL if it failed
                          const newPreview = URL.createObjectURL(file.file);
                          e.currentTarget.src = newPreview;
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', file.file.name);
                        }}
                      />
                      
                      {/* File Actions Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPreviewFile(file)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFile(file.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file.file.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* File Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={previewFile.preview}
                alt={previewFile.file.name}
                className="max-w-full max-h-full object-contain rounded"
                onError={(e) => {
                  console.error('Failed to load preview modal image:', previewFile.file.name);
                  // Try to recreate the preview URL if it failed
                  const newPreview = URL.createObjectURL(previewFile.file);
                  e.currentTarget.src = newPreview;
                }}
              />
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewFile(null)}
                className="absolute top-4 right-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Upload Status */}
        {files.length === 0 && question.is_required && (
          <p className="text-sm text-gray-500">
            At least one photo is required
          </p>
        )}
      </div>
    </BaseQuestion>
  );
} 