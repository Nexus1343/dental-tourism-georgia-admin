'use client'

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BaseQuestion } from './BaseQuestion';
import { QuestionRendererProps } from '@/types/questionnaire';
import { cn } from '@/lib/utils';

export function PainScaleQuestion({ 
  question, 
  value, 
  onChange, 
  onBlur, 
  error, 
  disabled = false,
  showValidation = true 
}: QuestionRendererProps) {
  const min = question.validation_rules?.min ?? 0;
  const max = question.validation_rules?.max ?? 10;
  
  // Generate scale options
  const scaleOptions = [];
  for (let i = min; i <= max; i++) {
    scaleOptions.push({
      value: i.toString(),
      label: i.toString(),
      description: getPainDescription(i)
    });
  }
  
  function getPainDescription(level: number): string {
    switch (level) {
      case 0: return 'No pain';
      case 1:
      case 2: return 'Mild pain';
      case 3:
      case 4: return 'Moderate pain';
      case 5:
      case 6: return 'Noticeable pain';
      case 7:
      case 8: return 'Severe pain';
      case 9:
      case 10: return 'Worst possible pain';
      default: return '';
    }
  }
  
  function getPainColor(level: number): string {
    if (level === 0) return 'text-green-600';
    if (level <= 2) return 'text-green-500';
    if (level <= 4) return 'text-yellow-500';
    if (level <= 6) return 'text-orange-500';
    if (level <= 8) return 'text-red-500';
    return 'text-red-700';
  }

  return (
    <BaseQuestion 
      question={question} 
      error={error} 
      showValidation={showValidation}
    >
      <div className="space-y-4">
        {/* Pain scale description */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          Rate your pain level from {min} (no pain) to {max} (worst possible pain)
        </div>
        
        <RadioGroup
          value={value?.toString() || ''}
          onValueChange={(val) => onChange(parseInt(val))}
          onBlur={onBlur}
          disabled={disabled}
          className="grid grid-cols-6 md:grid-cols-11 gap-2"
        >
          {scaleOptions.map((option) => (
            <div key={option.value} className="flex flex-col items-center space-y-1">
              <div className="flex flex-col items-center">
                <RadioGroupItem 
                  value={option.value} 
                  id={`${question.id}-${option.value}`}
                  className={cn(
                    "w-8 h-8",
                    error && showValidation && "border-red-500"
                  )}
                />
                <Label 
                  htmlFor={`${question.id}-${option.value}`}
                  className={cn(
                    "text-lg font-semibold cursor-pointer mt-1",
                    getPainColor(parseInt(option.value))
                  )}
                >
                  {option.label}
                </Label>
              </div>
              {/* Description for mobile/small scales */}
              {(max - min <= 5 || parseInt(option.value) % 2 === 0) && (
                <div className="text-xs text-center text-gray-500 leading-tight">
                  {option.description}
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
        
        {/* Current selection display */}
        {value !== undefined && value !== null && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Selected pain level:</span>
              <span className={cn(
                "text-lg font-semibold",
                getPainColor(parseInt(value.toString()))
              )}>
                {value}/10
              </span>
              <span className="text-sm text-gray-600">
                ({getPainDescription(parseInt(value.toString()))})
              </span>
            </div>
          </div>
        )}
      </div>
    </BaseQuestion>
  );
} 