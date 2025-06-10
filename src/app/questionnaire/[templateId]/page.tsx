import { Suspense } from "react";
import { Metadata } from "next";
import { TemplateIntroduction } from "@/components/questionnaire/TemplateIntroduction";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/lib/supabase";

interface TemplatePageProps {
  params: {
    templateId: string;
  };
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  try {
    const { data: template } = await supabase
      .from('questionnaire_templates')
      .select('name, description')
      .eq('id', params.templateId)
      .single();

    if (template) {
      return {
        title: `${template.name} - Dental Tourism Georgia`,
        description: template.description,
        openGraph: {
          title: template.name,
          description: template.description,
          type: 'website',
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Questionnaire - Dental Tourism Georgia',
    description: 'Complete your dental assessment questionnaire',
  };
}

export default function TemplatePage({ params }: TemplatePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Loading questionnaire details...</span>
          </div>
        }>
          <TemplateIntroduction templateId={params.templateId} />
        </Suspense>
      </div>
    </div>
  );
} 