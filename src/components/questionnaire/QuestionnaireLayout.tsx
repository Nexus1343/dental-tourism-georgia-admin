'use client'

import { useState } from "react";
import { QuestionnaireHeader } from "./QuestionnaireHeader";
import { cn } from "@/lib/utils";

interface QuestionnaireLayoutProps {
  children: React.ReactNode;
  className?: string;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export function QuestionnaireLayout({ 
  children, 
  className,
  showProgress = false,
  currentStep = 0,
  totalSteps = 0
}: QuestionnaireLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Questionnaire Header */}
      <QuestionnaireHeader 
        showProgress={showProgress}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
      
      {/* Main Content */}
      <main 
        className={cn(
          "pt-20", // Account for fixed header
          className
        )}
      >
        {children}
      </main>
    </div>
  );
} 