import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('patient_reviews')
      .select(`
        *,
        treatments (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching patient review:', error);
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in patient review GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      patient_name,
      patient_country,
      review_text,
      treatment_id,
      rating,
      is_verified,
      is_active,
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

    const updateData: any = {
      patient_name: patient_name.trim(),
      patient_country: patient_country.trim(),
      review_text: review_text.trim(),
      rating: parseInt(rating),
      updated_at: new Date().toISOString()
    };

    // Only include optional fields if they are provided
    if (typeof is_verified === 'boolean') {
      updateData.is_verified = is_verified;
    }
    
    if (typeof is_active === 'boolean') {
      updateData.is_active = is_active;
    }

    if (treatment_id !== undefined) {
      updateData.treatment_id = treatment_id;
    }

    if (patient_photo_url !== undefined) {
      updateData.patient_photo_url = patient_photo_url;
    }

    const { data, error } = await supabase
      .from('patient_reviews')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        treatments (
          id,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating patient review:', error);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in patient review PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('patient_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting patient review:', error);
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error in patient review DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 