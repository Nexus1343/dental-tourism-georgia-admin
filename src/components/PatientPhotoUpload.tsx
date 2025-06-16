'use client'

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PatientPhotoUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function PatientPhotoUpload({
  value,
  onChange,
  disabled = false,
  className
}: PatientPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', `patient-photos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
      formData.append('uploadType', 'patient-photo');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload photo');
      }

      onChange(result.data.publicUrl);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('Image must be smaller than 5MB');
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      uploadFile(file);
    }
    
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      uploadFile(file);
    }
  }, []);

  const handleRemovePhoto = () => {
    onChange(undefined);
    toast.success('Photo removed');
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Photo */}
      {value && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Patient Photo</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={disabled || uploading}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
            <div className="relative">
              <img
                src={value}
                alt="Patient photo"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Upload Patient Photo</h3>
              <p className="text-sm text-gray-600">
                Drag and drop a photo here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, WebP up to 5MB
              </p>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={openFileSelector}
                disabled={disabled || uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Choose Photo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />
    </div>
  );
} 