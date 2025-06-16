import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const language = searchParams.get('language') || '';
    const status = searchParams.get('status') || '';
    const is_featured = searchParams.get('is_featured');
    const sortBy = searchParams.get('sort_by') || 'order_index';
    const sortOrder = searchParams.get('sort_order') || 'asc';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('faqs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`
        question.ilike.%${search}%,
        answer.ilike.%${search}%,
        category.ilike.%${search}%
      `);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (language) {
      query = query.eq('language', language);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    if (is_featured !== null && is_featured !== '') {
      query = query.eq('is_featured', is_featured === 'true');
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: faqs, error, count } = await query;

    if (error) {
      console.error('Error fetching FAQs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch FAQs' },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      faqs: faqs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    const requiredFields = ['category', 'question', 'answer'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Prepare FAQ data
    const faqData = {
      category: body.category,
      question: body.question,
      answer: body.answer,
      language: body.language || 'en',
      order_index: body.order_index || 0,
      is_featured: body.is_featured || false,
      is_active: body.is_active !== undefined ? body.is_active : true
    };

    const { data: faq, error } = await supabase
      .from('faqs')
      .insert([faqData])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to create FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json(faq, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 