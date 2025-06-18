import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'active', 'inactive', or null for all
    const language = searchParams.get('language');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('questionnaire_templates')
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
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (status && status !== 'all') {
      const isActive = status === 'active';
      query = query.eq('is_active', isActive);
    }

    if (language && language !== 'all') {
      query = query.eq('language', language);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: templates, error, count } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    // Fetch clinic assignments and submissions counts for each template
    const templatesWithCounts = await Promise.all(
      (templates || []).map(async (template) => {
        // Get assigned clinics count
        const { data: clinicAssignments } = await supabase
          .from('clinic_questionnaire_templates')
          .select('id')
          .eq('template_id', template.id)
          .eq('is_active', true);

        // Get submissions count
        const { data: submissions } = await supabase
          .from('questionnaire_submissions')
          .select('id')
          .eq('template_id', template.id);

        return {
          ...template,
          assigned_clinics_count: clinicAssignments?.length || 0,
          submissions_count: submissions?.length || 0
        };
      })
    );

    return NextResponse.json({
      data: templatesWithCounts,
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const { data: template, error } = await supabase
      .from('questionnaire_templates')
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: template }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 