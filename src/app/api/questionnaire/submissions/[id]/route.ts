import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using them (Next.js 15+ requirement)
    const { id } = await params;
    
    const { data: submission, error } = await supabase
      .from('questionnaire_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      submission
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using them (Next.js 15+ requirement)
    const { id } = await params;
    
    const body = await request.json();
    const { submission_data, completion_percentage, time_spent_seconds } = body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (submission_data !== undefined) {
      updateData.submission_data = submission_data;
    }
    
    if (completion_percentage !== undefined) {
      updateData.completion_percentage = completion_percentage;
    }
    
    if (time_spent_seconds !== undefined) {
      updateData.time_spent_seconds = time_spent_seconds;
    }

    const { data: submission, error } = await supabase
      .from('questionnaire_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating submission:', error);
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      submission
    });

  } catch (error) {
    console.error('Submission update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 