'use client'

import React from 'react';
import { QuestionRendererProps } from '@/types/questionnaire';
import { TextQuestion } from './TextQuestion';
import { EmailQuestion } from './EmailQuestion';
import { NumberQuestion } from './NumberQuestion';
import { ChoiceQuestion } from './ChoiceQuestion';
import { PainScaleQuestion } from './PainScaleQuestion';
import { PhotoUploadQuestion } from './PhotoUploadQuestion';
import { FileUploadQuestion } from './FileUploadQuestion';

export function QuestionRenderer(props: QuestionRendererProps) {
  const { question } = props;

  switch (question.question_type) {
    case 'text':
    case 'textarea':
      return <TextQuestion {...props} />;
      
    case 'email':
      return <EmailQuestion {...props} />;
      
    case 'phone':
      // For now, use text renderer with phone validation
      return <TextQuestion {...props} />;
      
    case 'number':
      return <NumberQuestion {...props} />;
      
    case 'date':
    case 'date_picker':
      // Placeholder for date renderer
      return <TextQuestion {...props} />;
      
    case 'single_choice':
    case 'multiple_choice':
      return <ChoiceQuestion {...props} />;
      
    case 'checkbox':
      // Use multiple choice renderer for checkbox
      return <ChoiceQuestion {...props} />;
      
    case 'photo_upload':
      return <PhotoUploadQuestion {...props} />;
      
    case 'file_upload':
      return <FileUploadQuestion {...props} />;
      
    case 'photo_grid':
      // Use photo upload for now, can be specialized later
      return <PhotoUploadQuestion {...props} />;
      
    case 'pain_scale':
      return <PainScaleQuestion {...props} />;
      
    case 'rating':
    case 'slider':
    case 'tooth_chart':
    case 'budget_range':
      // Placeholder for specialized renderers
      return <TextQuestion {...props} />;
      
    default:
      console.warn(`Unknown question type: ${question.question_type}`);
      return <TextQuestion {...props} />;
  }
} 