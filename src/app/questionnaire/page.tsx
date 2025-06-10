import { Suspense } from "react";
import { TemplateSelection } from "@/components/questionnaire/TemplateSelection";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function QuestionnairePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Select Your Questionnaire
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the questionnaire that best matches your dental needs. 
            Each questionnaire is designed to help us understand your specific requirements.
          </p>
        </div>

        {/* Template Selection */}
        <Suspense fallback={
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Loading questionnaires...</span>
          </div>
        }>
          <TemplateSelection />
        </Suspense>
      </div>
    </div>
  );
} 