'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, Home, RotateCcw } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface QuestionnaireCompletionProps {
  templateId: string;
  submissionId?: string;
}

export function QuestionnaireCompletion({ templateId, submissionId }: QuestionnaireCompletionProps) {
  const [loading, setLoading] = useState(true);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    // Simulate loading and fetch template name
    const timer = setTimeout(() => {
      setLoading(false);
      setTemplateName("Dental Assessment Questionnaire"); // Mock data
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [templateId, submissionId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Processing completion...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-800 mb-2">
            Questionnaire Completed Successfully!
          </CardTitle>
          <p className="text-green-700">
            Thank you for completing the <strong>{templateName}</strong>
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Submission Details */}
          <div className="bg-white border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Submission Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Submission ID:</span>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {submissionId || "SUB-" + Date.now()}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Completed On:</span>
                <p className="text-sm text-gray-800">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-3">What Happens Next?</h3>
            <ul className="space-y-2 text-blue-700">
              <li>• Our dental team will review your responses</li>
              <li>• You'll receive a personalized treatment plan within 24-48 hours</li>
              <li>• We'll contact you to schedule a consultation if needed</li>
              <li>• Your information is securely stored and kept confidential</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Available Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
              <Link href="/questionnaire">
                <Button variant="outline" className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Take Another
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you have any questions about your submission or need assistance, 
              please don't hesitate to contact us.
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>📧 support@dentaltourismgeorgia.com</p>
              <p>📞 +995 XXX XXX XXX</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 