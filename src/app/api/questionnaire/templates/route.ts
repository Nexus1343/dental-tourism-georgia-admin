import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    
    const { data: templates, error } = await supabase
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
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questionnaire templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      templates: templates || [],
      count: templates?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 