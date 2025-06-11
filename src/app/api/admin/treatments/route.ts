import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('treatments')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        description.ilike.%${search}%,
        slug.ilike.%${search}%
      `);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: treatments, error, count } = await query;

    if (error) {
      console.error('Error fetching treatments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch treatments' },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      treatments: treatments || [],
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
    const requiredFields = ['name', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Generate slug from name if not provided
    const slug = body.slug || body.name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Prepare treatment data
    const treatmentData = {
      name: body.name,
      slug: slug,
      category: body.category,
      description: body.description || null,
      procedure_details: body.procedure_details || null,
      duration_minutes: body.duration_minutes || null,
      recovery_time_days: body.recovery_time_days || null,
      anesthesia_required: body.anesthesia_required || false,
      requirements: body.requirements || [],
      contraindications: body.contraindications || [],
      benefits: body.benefits || [],
      risks: body.risks || [],
      aftercare_instructions: body.aftercare_instructions || null,
      images: body.images || [],
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      seo_keywords: body.seo_keywords || [],
      is_active: body.is_active !== undefined ? body.is_active : true
    };

    const { data: treatment, error } = await supabase
      .from('treatments')
      .insert([treatmentData])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating treatment:', error);
      return NextResponse.json(
        { error: 'Failed to create treatment' },
        { status: 500 }
      );
    }

    return NextResponse.json(treatment, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 