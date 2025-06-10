'use client'

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { BaseQuestion } from './BaseQuestion';
import { QuestionRendererProps } from '@/types/questionnaire';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

export function EmailQuestion({ 
  question, 
  value = '', 
  onChange, 
  onBlur, 
  error, 
  disabled = false,
  showValidation = true 
}: QuestionRendererProps) {
  const [touched, setTouched] = useState(false);
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = value && emailRegex.test(value);
  const showFormatFeedback = touched && value && !error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  return (
    <BaseQuestion 
      question={question} 
      error={error} 
      showValidation={showValidation}
    >
      <div className="relative">
        <Input
          id={question.id}
          type="email"
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={question.placeholder_text || 'your.email@example.com'}
          className={cn(
            "pr-10 transition-colors",
            error && showValidation && "border-red-500 focus:border-red-500 focus:ring-red-500",
            isValidEmail && "border-green-500 focus:border-green-500"
          )}
        />
        
        {/* Format validation indicator */}
        {showFormatFeedback && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValidEmail ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Format feedback */}
      {touched && value && !error && !isValidEmail && (
        <p className="text-xs text-orange-600 mt-1">
          Please enter a valid email address
        </p>
      )}
    </BaseQuestion>
  );
} 