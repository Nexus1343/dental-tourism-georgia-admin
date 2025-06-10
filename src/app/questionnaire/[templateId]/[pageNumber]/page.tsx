import { Suspense } from "react";
import { QuestionnairePage } from "@/components/questionnaire/QuestionnairePage";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface QuestionnairePageProps {
  params: {
    templateId: string;
    pageNumber: string;
  };
}

export default function QuestionnaireFormPage({ params }: QuestionnairePageProps) {
  const pageNumber = parseInt(params.pageNumber);
  
  if (isNaN(pageNumber)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Page Number</h1>
          <p className="text-gray-600">The page number provided is not valid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Suspense fallback={
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">Loading questionnaire page...</span>
        </div>
      }>
        <QuestionnairePage 
          templateId={params.templateId} 
          pageNumber={pageNumber} 
        />
      </Suspense>
    </div>
  );
} 