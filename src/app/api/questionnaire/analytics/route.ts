import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, template_id, timestamp } = body;

    // Validate required fields
    if (!event || !template_id) {
      return NextResponse.json(
        { error: 'Missing required fields: event, template_id' },
        { status: 400 }
      );
    }

    // Insert analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: event,
        event_data: {
          template_id,
          user_agent: request.headers.get('user-agent'),
          timestamp: timestamp || new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error inserting analytics event:', error);
      return NextResponse.json(
        { error: 'Failed to track analytics event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 