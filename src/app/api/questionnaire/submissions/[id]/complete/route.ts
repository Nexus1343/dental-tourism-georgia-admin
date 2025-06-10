import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using them (Next.js 15+ requirement)
    const { id } = await params;
    
    const body = await request.json();
    const { submission_data, time_spent_seconds } = body;

    const now = new Date().toISOString();

    const { data: submission, error } = await supabase
      .from('questionnaire_submissions')
      .update({
        submission_data,
        is_complete: true,
        completion_percentage: 100,
        time_spent_seconds,
        completed_at: now,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error completing submission:', error);
      return NextResponse.json(
        { error: 'Failed to complete submission' },
        { status: 500 }
      );
    }

    // Track completion analytics
    try {
      await fetch(`${request.url.replace(/\/api\/questionnaire\/submissions\/.*/, '')}/api/questionnaire/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'questionnaire_completed',
          template_id: submission.template_id,
          submission_id: submission.id,
          time_spent_seconds,
          timestamp: now
        })
      });
    } catch (analyticsError) {
      // Analytics is non-critical, don't fail the completion
      console.warn('Analytics tracking failed:', analyticsError);
    }

    return NextResponse.json({
      submission,
      message: 'Questionnaire completed successfully'
    });

  } catch (error) {
    console.error('Completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 