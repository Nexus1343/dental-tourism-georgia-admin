import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    const { data: doctor, error } = await supabase
      .from('doctors')
      .select(`
        id,
        title,
        specializations,
        status,
        license_number,
        years_of_experience,
        education,
        certifications,
        languages,
        bio,
        consultation_fee,
        profile_image_url,
        gallery_images,
        achievements,
        publications,
        availability_schedule,
        seo_title,
        seo_description,
        created_at,
        updated_at,
        users!doctors_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          preferred_language
        ),
        clinics!doctors_clinic_id_fkey (
          id,
          name,
          slug,
          city,
          country,
          address,
          phone,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching doctor:', error);
      return NextResponse.json(
        { error: 'Failed to fetch doctor' },
        { status: 500 }
      );
    }

    return NextResponse.json(doctor);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Validate specializations if provided
    if (body.specializations && !Array.isArray(body.specializations)) {
      return NextResponse.json(
        { error: 'Specializations must be an array' },
        { status: 400 }
      );
    }

    // Prepare update data (only include fields that are present in request)
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Include only fields that are present in the request body
    const allowedFields = [
      'user_id', 'clinic_id', 'status', 'title', 'specializations',
      'license_number', 'years_of_experience', 'education', 'certifications',
      'languages', 'bio', 'consultation_fee', 'profile_image_url',
      'gallery_images', 'achievements', 'publications', 'availability_schedule',
      'seo_title', 'seo_description'
    ];

    allowedFields.forEach(field => {
      if (body.hasOwnProperty(field)) {
        updateData[field] = body[field];
      }
    });

    const { data: doctor, error } = await supabase
      .from('doctors')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        title,
        specializations,
        status,
        license_number,
        years_of_experience,
        education,
        certifications,
        languages,
        bio,
        consultation_fee,
        profile_image_url,
        gallery_images,
        achievements,
        publications,
        availability_schedule,
        seo_title,
        seo_description,
        created_at,
        updated_at,
        users!doctors_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          preferred_language
        ),
        clinics!doctors_clinic_id_fkey (
          id,
          name,
          slug,
          city,
          country,
          address,
          phone,
          email
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }
      console.error('Error updating doctor:', error);
      return NextResponse.json(
        { error: 'Failed to update doctor' },
        { status: 500 }
      );
    }

    return NextResponse.json(doctor);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // First check if the doctor exists
    const { data: existingDoctor, error: fetchError } = await supabase
      .from('doctors')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }
      console.error('Error checking doctor existence:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check doctor existence' },
        { status: 500 }
      );
    }

    // Delete the doctor
    const { error: deleteError } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting doctor:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete doctor' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Doctor deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 