import { Suspense } from "react";
import { QuestionnaireCompletion } from "@/components/questionnaire/QuestionnaireCompletion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CompletionPageProps {
  params: Promise<{
    templateId: string;
  }>;
  searchParams: Promise<{
    submissionId?: string;
  }>;
}

export default async function CompletionPage({ params, searchParams }: CompletionPageProps) {
  const { templateId } = await params;
  const { submissionId } = await searchParams;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Loading completion details...</span>
          </div>
        }>
          <QuestionnaireCompletion 
            templateId={templateId}
            submissionId={submissionId}
          />
        </Suspense>
      </div>
    </div>
  );
} 