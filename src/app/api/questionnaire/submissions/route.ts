import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { template_id, submission_token } = body;

    if (!template_id || !submission_token) {
      return NextResponse.json(
        { error: 'Missing required fields: template_id, submission_token' },
        { status: 400 }
      );
    }

    // Create new submission
    const { data: submission, error } = await supabase
      .from('questionnaire_submissions')
      .insert({
        template_id,
        submission_token,
        submission_data: {},
        is_complete: false,
        completion_percentage: 0,
        time_spent_seconds: 0,
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating submission:', error);
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      submission
    }, { status: 201 });

  } catch (error) {
    console.error('Submission creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 