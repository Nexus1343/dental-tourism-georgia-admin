import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = supabaseAdmin || supabase;
  const { id } = await params;
  const { data, error } = await client
    .from('questionnaire_submissions_detail')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data);
} 