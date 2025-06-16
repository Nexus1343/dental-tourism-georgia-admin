import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const rating = searchParams.get('rating') || '';
    const isVerified = searchParams.get('isVerified');
    const isActive = searchParams.get('isActive');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('patient_reviews')
      .select(`
        *,
        treatments (
          id,
          name
        )
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`patient_name.ilike.%${search}%,review_text.ilike.%${search}%`);
    }
    
    if (country) {
      query = query.eq('patient_country', country);
    }
    
    if (rating) {
      query = query.eq('rating', parseInt(rating));
    }
    
    if (isVerified !== null && isVerified !== '') {
      query = query.eq('is_verified', isVerified === 'true');
    }
    
    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true');
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching patient reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in patient reviews GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      patient_name,
      patient_country,
      review_text,
      treatment_id,
      rating,
      is_verified = false,
      is_active = true,
      patient_photo_url
    } = body;

    // Validation
    if (!patient_name || !patient_country || !review_text || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: patient_name, patient_country, review_text, rating' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const reviewData = {
      patient_name: patient_name.trim(),
      patient_country: patient_country.trim(),
      review_text: review_text.trim(),
      rating: parseInt(rating),
      is_verified,
      is_active,
      ...(treatment_id && { treatment_id }),
      ...(patient_photo_url && { patient_photo_url })
    };

    const { data, error } = await supabase
      .from('patient_reviews')
      .insert([reviewData])
      .select(`
        *,
        treatments (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating patient review:', error);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in patient reviews POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 