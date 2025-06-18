import type { Metadata } from "next";
import "../globals.css";
import { QuestionnaireLayout } from "@/components/questionnaire/QuestionnaireLayout";

export const metadata: Metadata = {
  title: "Questionnaire - Dental Tourism Georgia",
  description: "Complete your dental assessment questionnaire",
};

export default function QuestionnaireRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QuestionnaireLayout>
      {children}
    </QuestionnaireLayout>
  );
} 