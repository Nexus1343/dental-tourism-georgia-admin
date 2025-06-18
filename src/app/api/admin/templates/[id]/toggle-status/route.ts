import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First get the current template to check its current status
    const { data: currentTemplate, error: fetchError } = await supabase
      .from('questionnaire_templates')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError || !currentTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Toggle the status
    const newStatus = !currentTemplate.is_active;
    
    const { data: template, error } = await supabase
      .from('questionnaire_templates')
      .update({ 
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        name,
        description,
        version,
        is_active,
        language,
        total_pages,
        estimated_completion_minutes,
        introduction_text,
        completion_message,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Error toggling template status:', error);
      return NextResponse.json(
        { error: 'Failed to toggle template status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      data: template,
      message: `Template ${newStatus ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 