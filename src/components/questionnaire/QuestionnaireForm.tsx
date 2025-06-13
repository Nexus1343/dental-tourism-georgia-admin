'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { QuestionRenderer } from './questions/QuestionRenderer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WizardNavigation } from './WizardNavigation';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { QuestionnairePage, QuestionnaireQuestion } from '@/types/questionnaire';
import { getVisibleQuestions } from '@/utils/conditionalLogic';
import { validateQuestions, canNavigateFromPage } from '@/utils/questionnaireValidation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Home, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionnaireFormProps {
  templateId: string;
  pageNumber: number;
}

export function QuestionnaireForm({ templateId, pageNumber }: QuestionnaireFormProps) {
  const router = useRouter();
  const [pages, setPages] = useState<QuestionnairePage[]>([]);
  const [currentPageData, setCurrentPageData] = useState<QuestionnairePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  const {
    currentSubmission,
    answers,
    isDirty,
    updateAnswer,
    saveProgress,
    setCurrentPage,
    setTotalPages,
    getCompletionPercentage,
    getTimeSpentMinutes
  } = useQuestionnaireStore();

  // Auto-save functionality
  useAutoSave({
    enabled: isDirty && !!currentSubmission,
    onSave: saveProgress,
    onError: (error: any) => {
      console.error('Auto-save failed:', error);
    }
  });

  // Navigation guard to prevent data loss
  const { guardedNavigate } = useNavigationGuard({
    hasUnsavedChanges: isDirty,
    message: 'You have unsaved changes. Are you sure you want to leave this page?',
    onBeforeNavigate: async () => {
      if (isDirty) {
        try {
          await saveProgress();
          return true;
        } catch (error) {
          const userChoice = window.confirm(
            'Failed to save your changes. Do you still want to leave?'
          );
          return userChoice;
        }
      }
      return true;
    }
  });

  // Load pages and questions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/questionnaire/pages/${templateId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load questionnaire data');
        }
        
        const data = await response.json();
        setPages(data.pages);
        setTotalPages(data.pages.length);
        
        // Find current page
        const page = data.pages.find((p: QuestionnairePage) => p.page_number === pageNumber);
        if (!page) {
          throw new Error('Page not found');
        }
        
        setCurrentPageData(page);
        setCurrentPage(pageNumber);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load questionnaire');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [templateId, pageNumber, setCurrentPage, setTotalPages]);

  // Get visible questions based on conditional logic
  const visibleQuestions = currentPageData 
    ? getVisibleQuestions(currentPageData.questions, answers)
    : [];

  // Validate current page
  const validateCurrentPage = () => {
    if (!currentPageData) return false;
    
    const answerValues: Record<string, any> = {};
    Object.keys(answers).forEach(questionId => {
      answerValues[questionId] = answers[questionId].value;
    });
    
    const errors = validateQuestions(visibleQuestions, answerValues);
    setValidationErrors(errors);
    setShowValidation(true);
    
    return Object.keys(errors).length === 0;
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: any) => {
    updateAnswer(questionId, value, currentPageData?.id);
    
    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (!validateCurrentPage()) {
      // Scroll to first error
      scrollToFirstError();
      return;
    }
    
    const nextPageNumber = pageNumber + 1;
    const nextPage = pages.find(p => p.page_number === nextPageNumber);
    
    if (nextPage) {
      guardedNavigate(`/questionnaire/${templateId}/${nextPageNumber}`);
    } else {
      // Last page - go to completion
      guardedNavigate(`/questionnaire/${templateId}/complete`);
    }
  };

  const handlePrevious = () => {
    const prevPageNumber = pageNumber - 1;
    if (prevPageNumber > 0) {
      guardedNavigate(`/questionnaire/${templateId}/${prevPageNumber}`);
    } else {
      guardedNavigate(`/questionnaire/${templateId}`);
    }
  };

  const handlePageJump = (targetPage: number) => {
    guardedNavigate(`/questionnaire/${templateId}/${targetPage}`);
  };

  const handleSaveDraft = async () => {
    try {
      await saveProgress();
      announceNavigation('Draft saved successfully');
    } catch (error) {
      console.error('Failed to save draft:', error);
      announceNavigation('Failed to save draft');
    }
  };

  const handleExit = () => {
    guardedNavigate('/questionnaire');
  };

  // Check if navigation is allowed
  const answerValues: Record<string, any> = {};
  Object.keys(answers).forEach(questionId => {
    answerValues[questionId] = answers[questionId].value;
  });
  
  const canGoNext = currentPageData ? canNavigateFromPage(visibleQuestions, answerValues) : false;
  const canGoPrevious = pageNumber > 1 && (currentPageData?.allow_back_navigation ?? true);
  const isLastPage = pageNumber === pages.length;
  
  const completionPercentage = getCompletionPercentage();
  const timeSpentMinutes = getTimeSpentMinutes();
  // Estimate 2-3 minutes per page as a default
  const estimatedTotalTime = pages.length * 2.5; // 2.5 minutes per page
  const estimatedTimeRemaining = timeSpentMinutes < estimatedTotalTime 
    ? Math.max(0, estimatedTotalTime - timeSpentMinutes) 
    : undefined;

  // Keyboard navigation
  const { scrollToFirstError, announceNavigation } = useKeyboardNavigation({
    onNext: handleNext,
    onPrevious: handlePrevious,
    onSave: handleSaveDraft,
    canGoNext,
    canGoPrevious,
    isEnabled: !loading && !!currentPageData
  });

  if (loading) {
    return <LoadingSpinner message="Loading questionnaire..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentPageData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Page not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Enhanced Wizard Navigation */}
      <WizardNavigation
        currentPage={pageNumber}
        totalPages={pages.length}
        pages={pages}
        completionPercentage={completionPercentage}
        timeSpent={timeSpentMinutes * 60} // convert to seconds
        estimatedTimeRemaining={estimatedTimeRemaining ? estimatedTimeRemaining * 60 : undefined}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onPageJump={handlePageJump}
        onSaveDraft={handleSaveDraft}
        onExit={handleExit}
        isLastPage={isLastPage}
        showProgressBar={currentPageData.show_progress ?? true}
        showStepIndicator={true}
        showTimeEstimate={true}
        allowPageJumping={false} // Disable for now, can be enabled later
        className="mb-8"
      />

      {/* Page content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {currentPageData.title}
          </CardTitle>
          {currentPageData.description && (
            <p className="text-gray-600 mt-2">{currentPageData.description}</p>
          )}
          {currentPageData.instruction_text && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 text-sm">{currentPageData.instruction_text}</p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Validation errors summary */}
          {showValidation && Object.keys(validationErrors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the following errors before continuing:
                <ul className="list-disc list-inside mt-2">
                  {Object.values(validationErrors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Questions */}
          {visibleQuestions.length > 0 ? (
            <div className="space-y-8">
              {visibleQuestions.map((question) => (
                <QuestionRenderer
                  key={question.id}
                  question={question}
                  value={answers[question.id]?.value}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                  error={validationErrors[question.id]}
                  showValidation={showValidation}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No questions to display on this page.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Navigation - Duplicate for convenience */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
        {/* Left side - Previous and Exit */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={handleExit}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            title="Exit questionnaire"
          >
            <Home className="h-4 w-4" />
            Exit
          </Button>
        </div>

        {/* Center - Status message */}
        <div className="text-sm text-gray-500 text-center">
          {canGoNext ? (
            isLastPage ? 'Ready to complete' : 'Ready to continue'
          ) : (
            'Please complete required fields'
          )}
        </div>

        {/* Right side - Save Draft and Next */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSaveDraft}
            className="flex items-center gap-2"
            title="Save progress and continue later"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className={cn(
              "flex items-center gap-2",
              canGoNext ? "bg-green-600 hover:bg-green-700" : ""
            )}
          >
            {isLastPage ? 'Complete' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 