import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { QuestionnaireLayout } from "@/components/questionnaire/QuestionnaireLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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