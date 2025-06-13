'use client'

import React from 'react';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionnaireQuestion } from '@/types/questionnaire';
import ReactMarkdown from 'react-markdown';

interface BaseQuestionProps {
  question: QuestionnaireQuestion;
  children: React.ReactNode;
  error?: string;
  showValidation?: boolean;
  className?: string;
}

export function BaseQuestion({ 
  question, 
  children, 
  error, 
  showValidation = true,
  className 
}: BaseQuestionProps) {
  const hasError = error && showValidation;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Question Label and Help */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Label 
            htmlFor={question.id}
            className={cn(
              "text-base font-medium leading-relaxed",
              hasError && "text-red-700"
            )}
          >
            {question.question_text}
            {question.is_required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>
          
          {question.tooltip_text && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button">
                  <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">{question.tooltip_text}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Help Text */}
        {question.help_text && (
          <div className="text-sm text-gray-600 leading-relaxed">
            <style jsx>{`
              .markdown-help ul {
                list-style-type: disc;
                margin-left: 1.5em;
                margin-bottom: 0.5em;
              }
              .markdown-help ol {
                list-style-type: decimal;
                margin-left: 1.5em;
                margin-bottom: 0.5em;
              }
              .markdown-help li {
                margin-bottom: 0.25em;
              }
            `}</style>
            <div className="markdown-help">
              <ReactMarkdown>{question.help_text}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Question Input */}
      <div className="space-y-2">
        {children}
        
        {/* Error Message */}
        {hasError && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Validation Message (when no error but has custom validation message) */}
        {!hasError && question.validation_message && (
          <p className="text-xs text-gray-500">
            {question.validation_message}
          </p>
        )}
      </div>
    </div>
  );
} 