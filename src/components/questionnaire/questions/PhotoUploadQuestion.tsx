'use client'

import React, { useState, useRef, useCallback } from 'react';
import { BaseQuestion } from './BaseQuestion';
import { QuestionRendererProps } from '@/types/questionnaire';
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
  const [files, setFiles] = useState<UploadedFile[]>(value || []);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const maxFiles = question.validation_rules?.max_files || 5;
  const maxFileSize = question.validation_rules?.max_file_size || 10485760; // 10MB
  const acceptedTypes = question.validation_rules?.accepted_types || ['image/jpeg', 'image/png', 'image/heic'];
  
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
        {question.help_text && (
          <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
            {question.help_text}
          </div>
        )}
        
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