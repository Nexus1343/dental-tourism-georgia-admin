import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const client = supabaseAdmin || supabase;
  const { id } = params;

  try {
    // Use the new view that properly joins submission data with question details
    const { data: responses, error } = await client
      .from('questionnaire_submission_responses')
      .select('*')
      .eq('submission_id', id)
      .order('page_order', { ascending: true })
      .order('question_order', { ascending: true });

    if (error) {
      console.error('Error fetching responses:', error);
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    // Transform the data to match the expected format
    const formattedResponses = (responses || []).map(response => ({
      questionId: response.question_id,
      questionText: response.question_text,
      questionType: response.question_type,
      answer: response.answer_value,
      formattedAnswer: response.formatted_answer,
      pageTitle: response.page_title,
      pageOrder: response.page_order || 0,
      questionOrder: response.question_order || 0,
      answeredAt: response.answered_at,
      required: response.is_required || false,
      options: response.question_options
    }));

    return NextResponse.json({ responses: formattedResponses });

  } catch (error) {
    console.error('Error processing submission responses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 