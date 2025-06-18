import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const client = supabaseAdmin || supabase;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client
    .from('questionnaire_submissions_list')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  const is_complete = searchParams.get('is_complete');
  if (is_complete === 'true') query = query.eq('is_complete', true);
  if (is_complete === 'false') query = query.eq('is_complete', false);

  const template_name = searchParams.get('template_name');
  if (template_name) query = query.ilike('template_name', `%${template_name}%`);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
} 