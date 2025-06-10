'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Circle, 
  Clock, 
  Save,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestionnairePage } from '@/types/questionnaire';

interface WizardNavigationProps {
  currentPage: number;
  totalPages: number;
  pages: QuestionnairePage[];
  completionPercentage: number;
  timeSpent?: number; // in seconds
  estimatedTimeRemaining?: number; // in seconds
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onPageJump?: (pageNumber: number) => void;
  onSaveDraft?: () => void;
  onExit?: () => void;
  isLastPage?: boolean;
  showProgressBar?: boolean;
  showStepIndicator?: boolean;
  showTimeEstimate?: boolean;
  allowPageJumping?: boolean;
  className?: string;
}

export function WizardNavigation({
  currentPage,
  totalPages,
  pages,
  completionPercentage,
  timeSpent = 0,
  estimatedTimeRemaining,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  onPageJump,
  onSaveDraft,
  onExit,
  isLastPage = false,
  showProgressBar = true,
  showStepIndicator = true,
  showTimeEstimate = true,
  allowPageJumping = false,
  className
}: WizardNavigationProps) {
  
  // Helper function to format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) return 'Less than 1 minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };

  // Get page status for step indicator
  const getPageStatus = (pageNumber: number) => {
    if (pageNumber < currentPage) return 'completed';
    if (pageNumber === currentPage) return 'current';
    return 'upcoming';
  };

  // Check if page can be jumped to
  const canJumpToPage = (pageNumber: number) => {
    return allowPageJumping && pageNumber < currentPage;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Bar Section */}
      {showProgressBar && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-4">
              {showTimeEstimate && timeSpent > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Time: {formatTime(timeSpent)}</span>
                </div>
              )}
              <span className="font-medium">{Math.round(completionPercentage)}% complete</span>
            </div>
          </div>
          
          <Progress 
            value={completionPercentage} 
            className="h-2 transition-all duration-300" 
          />
          
          {showTimeEstimate && estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
            <div className="text-xs text-gray-500 text-center">
              Estimated time remaining: {formatTime(estimatedTimeRemaining)}
            </div>
          )}
        </div>
      )}

      {/* Step Indicator */}
      {showStepIndicator && totalPages <= 10 && (
        <div className="px-2">
          <div className="flex items-center justify-between">
            {pages.slice(0, totalPages).map((page, index) => {
              const pageNumber = index + 1;
              const status = getPageStatus(pageNumber);
              const canJump = canJumpToPage(pageNumber);
              
              return (
                <div key={page.id} className="flex items-center">
                  {/* Step circle */}
                  <div className="relative">
                    <button
                      onClick={() => canJump && onPageJump?.(pageNumber)}
                      disabled={!canJump}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all duration-200",
                        status === 'completed' && "bg-green-600 border-green-600 text-white hover:bg-green-700",
                        status === 'current' && "bg-blue-600 border-blue-600 text-white ring-2 ring-blue-200",
                        status === 'upcoming' && "bg-white border-gray-300 text-gray-500",
                        canJump && status === 'completed' && "hover:scale-105 cursor-pointer",
                        !canJump && "cursor-default"
                      )}
                      title={canJump ? `Jump to ${page.title}` : page.title}
                    >
                      {status === 'completed' ? (
                        <Check className="h-3 w-3" />
                      ) : status === 'current' ? (
                        pageNumber
                      ) : (
                        <Circle className="h-2 w-2 fill-current" />
                      )}
                    </button>
                    
                    {/* Page title tooltip on hover for smaller screens */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {page.title}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connector line */}
                  {index < totalPages - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-2 transition-colors duration-200",
                      pageNumber < currentPage ? "bg-green-600" : "bg-gray-300"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Current page title */}
          <div className="text-center mt-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {pages[currentPage - 1]?.title}
            </h3>
            {pages[currentPage - 1]?.description && (
              <p className="text-sm text-gray-600 mt-1">
                {pages[currentPage - 1].description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Condensed progress for many pages */}
      {showStepIndicator && totalPages > 10 && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              Step {currentPage} of {totalPages}
            </Badge>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                const isCompleted = pageNum < currentPage;
                
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors duration-200",
                      isCompleted && "bg-green-600",
                      isActive && "bg-blue-600",
                      !isCompleted && !isActive && "bg-gray-300"
                    )}
                  />
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-gray-400 mx-1">...</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    currentPage === totalPages ? "bg-blue-600" : currentPage > totalPages ? "bg-green-600" : "bg-gray-300"
                  )} />
                </>
              )}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900">
            {pages[currentPage - 1]?.title}
          </h3>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        {/* Left side - Previous and Exit */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {onExit && (
            <Button
              type="button"
              variant="ghost"
              onClick={onExit}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              title="Exit questionnaire"
            >
              <Home className="h-4 w-4" />
              Exit
            </Button>
          )}
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
          {onSaveDraft && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSaveDraft}
              className="flex items-center gap-2"
              title="Save progress and continue later"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
          )}
          
          <Button
            type="button"
            onClick={onNext}
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