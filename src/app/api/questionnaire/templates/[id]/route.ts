import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using them (Next.js 15+ requirement)
    const { id } = await params;
    
    const { data: template, error } = await supabase
      .from('questionnaire_templates')
      .select(`
        id,
        name,
        description,
        total_pages,
        estimated_completion_minutes,
        is_active,
        introduction_text,
        completion_message,
        created_at
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      template
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 