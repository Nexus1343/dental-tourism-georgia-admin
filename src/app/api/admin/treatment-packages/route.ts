import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const clinic_id = searchParams.get('clinic_id') || '';
    const status = searchParams.get('status') || '';
    const includes_accommodation = searchParams.get('includes_accommodation');
    const includes_transportation = searchParams.get('includes_transportation');
    const includes_tourism = searchParams.get('includes_tourism');
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('treatment_packages')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        description.ilike.%${search}%
      `);
    }

    if (clinic_id) {
      query = query.eq('clinic_id', clinic_id);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    if (includes_accommodation !== null) {
      query = query.eq('includes_accommodation', includes_accommodation === 'true');
    }

    if (includes_transportation !== null) {
      query = query.eq('includes_transportation', includes_transportation === 'true');
    }

    if (includes_tourism !== null) {
      query = query.eq('includes_tourism', includes_tourism === 'true');
    }

    if (min_price) {
      const calculatedPrice = `(total_base_price * (1 - COALESCE(discount_percentage, 0) / 100))`;
      query = query.gte(calculatedPrice, parseFloat(min_price));
    }

    if (max_price) {
      const calculatedPrice = `(total_base_price * (1 - COALESCE(discount_percentage, 0) / 100))`;
      query = query.lte(calculatedPrice, parseFloat(max_price));
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: packages, error, count } = await query;

    if (error) {
      console.error('Error fetching treatment packages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch treatment packages' },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      packages: packages || [],
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
    const requiredFields = ['name', 'treatment_ids', 'total_base_price'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate treatment_ids is an array
    if (!Array.isArray(body.treatment_ids) || body.treatment_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one treatment must be selected' },
        { status: 400 }
      );
    }

    // Validate price is a positive number
    if (typeof body.total_base_price !== 'number' || body.total_base_price <= 0) {
      return NextResponse.json(
        { error: 'Total base price must be a positive number' },
        { status: 400 }
      );
    }

    // Prepare package data
    const packageData = {
      clinic_id: body.clinic_id || null,
      name: body.name,
      description: body.description || null,
      treatment_ids: body.treatment_ids,
      total_base_price: body.total_base_price,
      discount_percentage: body.discount_percentage || 0,
      min_duration_days: body.min_duration_days || null,
      max_duration_days: body.max_duration_days || null,
      includes_accommodation: body.includes_accommodation || false,
      includes_transportation: body.includes_transportation || false,
      includes_tourism: body.includes_tourism || false,
      package_benefits: body.package_benefits || [],
      terms_and_conditions: body.terms_and_conditions || null,
      is_active: body.is_active !== undefined ? body.is_active : true
    };

    const { data: treatmentPackage, error } = await supabase
      .from('treatment_packages')
      .insert([packageData])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating treatment package:', error);
      return NextResponse.json(
        { error: 'Failed to create treatment package' },
        { status: 500 }
      );
    }

    return NextResponse.json(treatmentPackage, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 