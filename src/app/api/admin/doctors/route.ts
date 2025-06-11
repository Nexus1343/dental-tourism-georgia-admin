import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const clinicId = searchParams.get('clinic_id') || '';
    const specialization = searchParams.get('specialization') || '';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('doctors')
      .select(`
        id,
        title,
        specializations,
        status,
        license_number,
        years_of_experience,
        consultation_fee,
        profile_image_url,
        created_at,
        updated_at,
        users!doctors_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        clinics!doctors_clinic_id_fkey (
          id,
          name,
          city,
          country
        )
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`
        users.first_name.ilike.%${search}%,
        users.last_name.ilike.%${search}%,
        users.email.ilike.%${search}%,
        license_number.ilike.%${search}%,
        title.ilike.%${search}%
      `);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    if (specialization) {
      query = query.contains('specializations', [specialization]);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: doctors, error, count } = await query;

    if (error) {
      console.error('Error fetching doctors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch doctors' },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      doctors: doctors || [],
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
    const requiredFields = ['title', 'specializations'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate specializations is an array
    if (!Array.isArray(body.specializations)) {
      return NextResponse.json(
        { error: 'Specializations must be an array' },
        { status: 400 }
      );
    }

    // Prepare doctor data
    const doctorData = {
      user_id: body.user_id || null,
      clinic_id: body.clinic_id || null,
      status: body.status || 'active',
      title: body.title,
      specializations: body.specializations,
      license_number: body.license_number || null,
      years_of_experience: body.years_of_experience || null,
      education: body.education || [],
      certifications: body.certifications || [],
      languages: body.languages || ['en'],
      bio: body.bio || null,
      consultation_fee: body.consultation_fee || null,
      profile_image_url: body.profile_image_url || null,
      gallery_images: body.gallery_images || [],
      achievements: body.achievements || [],
      publications: body.publications || [],
      availability_schedule: body.availability_schedule || null,
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null
    };

    const { data: doctor, error } = await supabase
      .from('doctors')
      .insert([doctorData])
      .select(`
        id,
        title,
        specializations,
        status,
        license_number,
        years_of_experience,
        consultation_fee,
        profile_image_url,
        created_at,
        updated_at,
        users!doctors_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        clinics!doctors_clinic_id_fkey (
          id,
          name,
          city,
          country
        )
      `)
      .single();

    if (error) {
      console.error('Error creating doctor:', error);
      return NextResponse.json(
        { error: 'Failed to create doctor' },
        { status: 500 }
      );
    }

    return NextResponse.json(doctor, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 