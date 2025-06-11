'use client'

import React, { useState, useRef, useCallback } from 'react';
import { BaseQuestion } from './BaseQuestion';
import { QuestionRendererProps } from '@/types/questionnaire';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'pdf' | 'document';
}

export function FileUploadQuestion({ 
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const maxFiles = question.validation_rules?.max_files || 10;
  const maxFileSize = question.validation_rules?.max_file_size || 20971520; // 20MB
  const acceptedTypes = question.validation_rules?.accepted_types || ['image/jpeg', 'image/png', 'application/pdf'];
  
  const getFileType = (file: File): 'image' | 'pdf' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    return 'document';
  };
  
  const getFileIcon = (type: 'image' | 'pdf' | 'document') => {
    switch (type) {
      case 'image': return <Image className="h-8 w-8 text-blue-500" />;
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />;
      default: return <File className="h-8 w-8 text-gray-500" />;
    }
  };
  
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
      const type = getFileType(file);
      const preview = type === 'image' ? URL.createObjectURL(file) : undefined;
      
      processedFiles.push({
        id,
        file,
        preview,
        type
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
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  }, [files, onChange]);
  
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

        {/* Example Photo */}
        {(() => {
          const options = question.options as any;
          const examplePhoto = options?.example_photo;
          return examplePhoto?.url && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">Example File</h4>
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={examplePhoto.url}
                    alt="Example file"
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
                Drag and drop files here, or
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Maximum {maxFiles} files, up to {formatFileSize(maxFileSize)} each
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported: {acceptedTypes.map(type => {
                  if (type.includes('image')) return 'Images';
                  if (type.includes('pdf')) return 'PDF';
                  return type.split('/')[1]?.toUpperCase();
                }).filter(Boolean).join(', ')}
              </p>
            </div>
            
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
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              Uploaded Files ({files.length}/{maxFiles})
            </h4>
            
            <div className="space-y-2">
              {files.map((file) => (
                <Card key={file.id} className="p-3">
                  <div className="flex items-center space-x-3">
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(file.type)
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.file.size)} • {file.type.toUpperCase()}
                      </p>
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Upload Status */}
        {files.length === 0 && question.is_required && (
          <p className="text-sm text-gray-500">
            At least one file is required
          </p>
        )}
      </div>
    </BaseQuestion>
  );
} 