'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, ArrowLeft, Play } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuestionnaireStore } from "@/stores/questionnaireStore";

interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  total_pages: number;
  estimated_completion_minutes: number;
  introduction_text?: string;
  completion_message?: string;
}

interface TemplateIntroductionProps {
  templateId: string;
}

export function TemplateIntroduction({ templateId }: TemplateIntroductionProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<QuestionnaireTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingSession, setStartingSession] = useState(false);
  
  const initializeSession = useQuestionnaireStore((state) => state.initializeSession);
  const setTotalPages = useQuestionnaireStore((state) => state.setTotalPages);

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/questionnaire/templates/${templateId}`);
      
      if (!response.ok) {
        throw new Error('Template not found');
      }
      
      const data = await response.json();
      setTemplate(data.template);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuestionnaire = async () => {
    if (!template) return;
    
    try {
      setStartingSession(true);
      
      // Initialize the questionnaire session
      await initializeSession(templateId);
      setTotalPages(template.total_pages);
      
      // Navigate to the first page
      router.push(`/questionnaire/${templateId}/1`);
    } catch (error) {
      console.error('Failed to start questionnaire:', error);
      setError('Failed to start questionnaire. Please try again.');
    } finally {
      setStartingSession(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading questionnaire details...</span>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Questionnaire Not Found</h3>
          <p className="text-red-600 mb-4">{error || 'The requested questionnaire could not be found.'}</p>
          <Link href="/questionnaire">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Questionnaires
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/questionnaire">
          <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Questionnaires
          </Button>
        </Link>
      </div>

      {/* Template Introduction Card */}
      <Card className="border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">{template.name}</CardTitle>
          <CardDescription className="text-lg">{template.description}</CardDescription>
          
          {/* Template Metadata */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{template.estimated_completion_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{template.total_pages} pages</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Introduction Text */}
          {template.introduction_text && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 mb-3">Before You Begin</h3>
              <p className="text-green-700 whitespace-pre-wrap">{template.introduction_text}</p>
            </div>
          )}

          {/* What to Expect */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3">What to Expect</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• Complete {template.total_pages} pages of questions</li>
              <li>• Estimated completion time: {template.estimated_completion_minutes} minutes</li>
              <li>• Your progress will be automatically saved</li>
              <li>• You can return to complete it later if needed</li>
              <li>• All information is kept confidential and secure</li>
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Privacy & Data</h3>
            <p className="text-gray-600 text-sm">
              Your responses are securely stored and will only be used to provide you with 
              personalized dental care recommendations. We do not share your information 
              with third parties without your consent.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            <Link href="/questionnaire">
              <Button variant="outline" size="lg">
                Choose Different Questionnaire
              </Button>
            </Link>
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleStartQuestionnaire}
              disabled={startingSession}
            >
              {startingSession ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Questionnaire
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 