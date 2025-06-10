import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    // Await params before using them (Next.js 15+ requirement)
    const { templateId } = await params;
    
    // Fetch pages for the template
    const { data: pages, error: pagesError } = await supabase
      .from('questionnaire_pages')
      .select(`
        id,
        page_number,
        title,
        description,
        instruction_text,
        page_type,
        validation_rules,
        show_progress,
        allow_back_navigation,
        auto_advance
      `)
      .eq('template_id', templateId)
      .order('page_number', { ascending: true });

    if (pagesError) {
      console.error('Error fetching pages:', pagesError);
      return NextResponse.json(
        { error: 'Failed to fetch questionnaire pages' },
        { status: 500 }
      );
    }

    // Fetch questions for all pages
    const { data: questions, error: questionsError } = await supabase
      .from('questionnaire_questions')
      .select(`
        id,
        page_id,
        section,
        question_text,
        question_type,
        options,
        validation_rules,
        is_required,
        order_index,
        conditional_logic,
        help_text,
        placeholder_text,
        question_group,
        display_logic,
        validation_message,
        tooltip_text
      `)
      .eq('template_id', templateId)
      .order('page_id, order_index', { ascending: true });

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return NextResponse.json(
        { error: 'Failed to fetch questionnaire questions' },
        { status: 500 }
      );
    }

    // Group questions by page
    const pageMap = new Map();
    pages?.forEach(page => {
      pageMap.set(page.id, {
        ...page,
        questions: []
      });
    });

    questions?.forEach(question => {
      const page = pageMap.get(question.page_id);
      if (page) {
        page.questions.push(question);
      }
    });

    const pagesWithQuestions = Array.from(pageMap.values());

    return NextResponse.json({
      pages: pagesWithQuestions,
      totalPages: pages?.length || 0
    });

  } catch (error) {
    console.error('Error fetching questionnaire data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 