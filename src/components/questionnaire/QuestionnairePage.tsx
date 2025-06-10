'use client'

import { QuestionnaireForm } from './QuestionnaireForm';

interface QuestionnairePageProps {
  templateId: string;
  pageNumber: number;
}

export function QuestionnairePage({ templateId, pageNumber }: QuestionnairePageProps) {
  return (
    <QuestionnaireForm 
      templateId={templateId}
      pageNumber={pageNumber}
    />
  );
} 