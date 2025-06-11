import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const city = searchParams.get('city') || '';
    const country = searchParams.get('country') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('clinics')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        description.ilike.%${search}%,
        city.ilike.%${search}%,
        address.ilike.%${search}%
      `);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (city) {
      query = query.eq('city', city);
    }

    if (country) {
      query = query.eq('country', country);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: clinics, error, count } = await query;

    if (error) {
      console.error('Error fetching clinics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clinics' },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      clinics: clinics || [],
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
    const requiredFields = ['name', 'slug', 'country'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Prepare clinic data
    const clinicData = {
      name: body.name,
      slug: body.slug,
      status: body.status || 'pending_approval',
      description: body.description || null,
      address: body.address || null,
      city: body.city || null,
      country: body.country,
      phone: body.phone || null,
      email: body.email || null,
      website: body.website || null,
      established_year: body.established_year || null,
      license_number: body.license_number || null,
      accreditations: body.accreditations || [],
      facilities: body.facilities || [],
      languages_spoken: body.languages_spoken || [],
      operating_hours: body.operating_hours || null,
      coordinates: body.coordinates || null,
      images: body.images || [],
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      seo_keywords: body.seo_keywords || []
    };

    const { data: clinic, error } = await supabase
      .from('clinics')
      .insert([clinicData])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating clinic:', error);
      return NextResponse.json(
        { error: 'Failed to create clinic' },
        { status: 500 }
      );
    }

    return NextResponse.json(clinic, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 