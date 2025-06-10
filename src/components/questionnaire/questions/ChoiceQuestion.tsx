'use client'

import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BaseQuestion } from './BaseQuestion';
import { QuestionRendererProps, QuestionOption } from '@/types/questionnaire';
import { cn } from '@/lib/utils';

export function ChoiceQuestion({ 
  question, 
  value, 
  onChange, 
  onBlur, 
  error, 
  disabled = false,
  showValidation = true 
}: QuestionRendererProps) {
  const [otherValue, setOtherValue] = useState('');
  const isMultipleChoice = question.question_type === 'multiple_choice';
  
  // Transform options from database format (string array) to component format
  const transformOptions = (rawOptions: any): QuestionOption[] => {
    if (!rawOptions) return [];
    
    // If already in correct format, return as is
    if (Array.isArray(rawOptions) && rawOptions.length > 0 && typeof rawOptions[0] === 'object' && 'id' in rawOptions[0]) {
      return rawOptions;
    }
    
    // Handle nested format: {"options": [...]}
    if (rawOptions && typeof rawOptions === 'object' && rawOptions.options && Array.isArray(rawOptions.options)) {
      const nestedOptions = rawOptions.options;
      // Check if nested options are already in correct format
      if (nestedOptions.length > 0 && typeof nestedOptions[0] === 'object' && 'id' in nestedOptions[0]) {
        return nestedOptions.map((option: any) => ({
          id: option.id,
          label: option.label,
          value: option.value,
          isOther: option.value?.toLowerCase() === 'other' || option.label?.toLowerCase() === 'other'
        }));
      }
      // Handle nested string array
      if (nestedOptions.length > 0 && typeof nestedOptions[0] === 'string') {
        return nestedOptions.map((option: string, index: number) => ({
          id: `option-${index}`,
          label: option,
          value: option,
          isOther: option.toLowerCase() === 'other'
        }));
      }
    }
    
    // Transform string array to QuestionOption format
    if (Array.isArray(rawOptions)) {
      return rawOptions.map((option: string, index: number) => ({
        id: `option-${index}`,
        label: option,
        value: option,
        isOther: option.toLowerCase() === 'other'
      }));
    }
    
    return [];
  };
  
  const options = transformOptions(question.options);
  
  // Check if "allow_other" is enabled in validation rules
  const allowOther = question.validation_rules?.allow_other === true;
  
  // Find "Other" option or create one if allow_other is enabled
  let otherOption = options.find(opt => opt.isOther);
  if (!otherOption && allowOther) {
    // Add "Other" option if not present but allowed
    otherOption = {
      id: 'other',
      label: 'Other',
      value: 'Other',
      isOther: true
    };
  }
  
  const regularOptions = options.filter(opt => !opt.isOther);
  
  // Handle single choice
  const handleSingleChoice = (selectedValue: string) => {
    if (selectedValue === 'Other' || selectedValue === 'other') {
      onChange({ value: 'Other', otherText: otherValue });
    } else {
      onChange(selectedValue);
      setOtherValue(''); // Clear other text when selecting regular option
    }
  };
  
  // Handle multiple choice
  const handleMultipleChoice = (optionValue: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? value : [];
    
    if (optionValue === 'Other' || optionValue === 'other') {
      if (checked) {
        onChange([...currentValues.filter(v => v !== 'Other' && !(typeof v === 'object' && v.value === 'Other')), { value: 'Other', otherText: otherValue }]);
      } else {
        onChange(currentValues.filter(v => v !== 'Other' && !(typeof v === 'object' && v.value === 'Other')));
        setOtherValue('');
      }
    } else {
      if (checked) {
        onChange([...currentValues, optionValue]);
      } else {
        onChange(currentValues.filter(v => v !== optionValue));
      }
    }
  };
  
  // Handle other text input
  const handleOtherTextChange = (text: string) => {
    setOtherValue(text);
    
    if (isMultipleChoice) {
      const currentValues = Array.isArray(value) ? value : [];
      const hasOtherSelected = currentValues.some(v => typeof v === 'object' && (v.value === 'Other' || v.value === 'other'));
      
      if (hasOtherSelected) {
        const updatedValues = currentValues.map(v => 
          typeof v === 'object' && (v.value === 'Other' || v.value === 'other')
            ? { value: 'Other', otherText: text }
            : v
        );
        onChange(updatedValues);
      }
    } else {
      if (typeof value === 'object' && (value?.value === 'Other' || value?.value === 'other')) {
        onChange({ value: 'Other', otherText: text });
      }
    }
  };
  
  // Check if option is selected
  const isOptionSelected = (optionValue: string) => {
    if (isMultipleChoice) {
      const currentValues = Array.isArray(value) ? value : [];
      if (optionValue === 'Other' || optionValue === 'other') {
        return currentValues.some(v => 
          v === 'Other' || 
          v === 'other' || 
          (typeof v === 'object' && (v.value === 'Other' || v.value === 'other'))
        );
      }
      return currentValues.includes(optionValue);
    } else {
      if (optionValue === 'Other' || optionValue === 'other') {
        return value === 'Other' || value === 'other' || (typeof value === 'object' && (value?.value === 'Other' || value?.value === 'other'));
      }
      return value === optionValue;
    }
  };
  
  // Get other text value
  const getOtherText = () => {
    if (isMultipleChoice) {
      const currentValues = Array.isArray(value) ? value : [];
      const otherItem = currentValues.find(v => typeof v === 'object' && (v.value === 'Other' || v.value === 'other'));
      return otherItem?.otherText || otherValue;
    } else {
      return typeof value === 'object' && (value?.value === 'Other' || value?.value === 'other') ? value.otherText : otherValue;
    }
  };

  if (isMultipleChoice) {
    return (
      <BaseQuestion 
        question={question} 
        error={error} 
        showValidation={showValidation}
      >
        <div className="space-y-3">
          {regularOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}-${option.id}`}
                checked={isOptionSelected(option.value)}
                onCheckedChange={(checked: boolean) => handleMultipleChoice(option.value, !!checked)}
                disabled={disabled}
                className={cn(
                  error && showValidation && "border-red-500"
                )}
              />
              <Label 
                htmlFor={`${question.id}-${option.id}`}
                className="text-sm font-normal leading-relaxed cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
          
          {otherOption && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-other`}
                  checked={isOptionSelected('Other')}
                  onCheckedChange={(checked: boolean) => handleMultipleChoice('Other', !!checked)}
                  disabled={disabled}
                  className={cn(
                    error && showValidation && "border-red-500"
                  )}
                />
                <Label 
                  htmlFor={`${question.id}-other`}
                  className="text-sm font-normal leading-relaxed cursor-pointer"
                >
                  {otherOption.label}
                </Label>
              </div>
              
              {isOptionSelected('Other') && (
                <Input
                  value={getOtherText()}
                  onChange={(e) => handleOtherTextChange(e.target.value)}
                  onBlur={onBlur}
                  placeholder="Please specify..."
                  disabled={disabled}
                  className="ml-6"
                />
              )}
            </div>
          )}
        </div>
      </BaseQuestion>
    );
  }

  // Single choice (radio)
  return (
    <BaseQuestion 
      question={question} 
      error={error} 
      showValidation={showValidation}
    >
      <RadioGroup
        value={typeof value === 'object' && (value?.value === 'Other' || value?.value === 'other') ? 'Other' : value || ''}
        onValueChange={handleSingleChoice}
        disabled={disabled}
        className="space-y-3"
      >
        {regularOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={option.value} 
              id={`${question.id}-${option.id}`}
              className={cn(
                error && showValidation && "border-red-500"
              )}
            />
            <Label 
              htmlFor={`${question.id}-${option.id}`}
              className="text-sm font-normal leading-relaxed cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
        
        {otherOption && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="Other" 
                id={`${question.id}-other`}
                className={cn(
                  error && showValidation && "border-red-500"
                )}
              />
              <Label 
                htmlFor={`${question.id}-other`}
                className="text-sm font-normal leading-relaxed cursor-pointer"
              >
                {otherOption.label}
              </Label>
            </div>
            
            {isOptionSelected('Other') && (
              <Input
                value={getOtherText()}
                onChange={(e) => handleOtherTextChange(e.target.value)}
                onBlur={onBlur}
                placeholder="Please specify..."
                disabled={disabled}
                className="ml-6"
              />
            )}
          </div>
        )}
      </RadioGroup>
    </BaseQuestion>
  );
} 