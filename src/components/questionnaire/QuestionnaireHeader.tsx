'use client'

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface QuestionnaireHeaderProps {
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  templateName?: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function QuestionnaireHeader({
  showProgress = false,
  currentStep = 0,
  totalSteps = 0,
  templateName,
  onBack,
  showBackButton = false
}: QuestionnaireHeaderProps) {
  const progressPercentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation */}
          <div className="flex items-center gap-4">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>

          {/* Center - Title */}
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {templateName || "Dental Assessment"}
            </h1>
            {showProgress && totalSteps > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Step {currentStep} of {totalSteps}
              </p>
            )}
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <Link href="/questionnaire">
              <Button variant="outline" size="sm">
                All Questionnaires
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && totalSteps > 0 && (
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Started</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
              <span>Finished</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 